<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Return the Stripe publishable key to the frontend.
     */
    public function publicKey()
    {
        return response()->json(['key' => config('services.stripe.key')]);
    }

    public function confirmOrderPaid(Request $request)
    {
        $fields = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'payment_intent_id' => 'required|string',
        ]);

        $order = Order::where('id', $fields['order_id'])
            ->where('user_id', auth()->id())
            ->where('payment_method', 'card')
            ->firstOrFail();

        if ($order->stripe_payment_intent_id !== $fields['payment_intent_id']) {
            return response()->json(['message' => 'PaymentIntent mismatch for this order'], 422);
        }

        if ($order->payment_status === 'paid') {
            return response()->json($order);
        }

        DB::transaction(function () use ($order, $fields) {
            $order->payment_status = 'paid';
            $order->status = 'confirmed';
            $order->save();

            if (!empty($order->phone)) {
                $sms = new \App\Services\SmsService();
                $message = "Hi {$order->first_name}, your payment for order #{$order->id} (LKR {$order->total_price}) was successful. Status: CONFIRMED.";
                $sms->sendSms($order->phone, $message);
            }

            $existing = Transaction::where('order_id', $order->id)->first();
            if (!$existing) {
                Transaction::create([
                    'order_id' => $order->id,
                    'amount' => $order->total_price,
                    'payment_method' => 'card',
                    'status' => 'completed',
                    'reference_number' => $fields['payment_intent_id'],
                ]);
            }

            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->quantity = max(0, $product->quantity - $item->quantity);
                    $product->save();
                }
            }
        });

        return response()->json($order->fresh(['items']));
    }

    /**
     * Create a Stripe PaymentIntent for a card order.
     * The order is created in the DB with payment_status=pending and the PI id is stored.
     * The frontend then uses the client_secret to confirm the payment.
     */
    public function createPaymentIntent(Request $request)
    {
        $fields = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'city' => 'required|string',
            'zip' => 'required|string',
        ]);

        try {
            return DB::transaction(function () use ($fields) {
                $totalPrice = 0;
                $orderItemsData = [];

                foreach ($fields['items'] as $item) {
                    $product = Product::lockForUpdate()->find($item['id']);

                    if (!$product || $product->quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product: " . ($product->name ?? 'Unknown'));
                    }

                    $totalPrice += $product->price * $item['quantity'];

                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                        'product_model' => $product,
                    ];
                }

                // Create Stripe PaymentIntent (amount in cents / paise / smallest currency unit)
                $paymentIntent = PaymentIntent::create([
                    'amount' => (int) round($totalPrice * 100), // e.g. USD cents
                    'currency' => 'usd',
                    'metadata' => [
                        'user_id' => auth()->id(),
                        'email' => $fields['email'],
                    ],
                    'automatic_payment_methods' => ['enabled' => true],
                ]);

                // Create Order in DB with pending payment status
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'total_price' => $totalPrice,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => 'card',
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'shipping_address' => $fields['shipping_address'],
                    'first_name' => $fields['first_name'],
                    'last_name' => $fields['last_name'],
                    'email' => $fields['email'],
                    'phone' => $fields['phone'] ?? null,
                    'city' => $fields['city'],
                    'zip' => $fields['zip'],
                ]);

                // Create order items (deduct stock happens after payment confirmation via webhook)
                foreach ($orderItemsData as $data) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $data['product_id'],
                        'quantity' => $data['quantity'],
                        'price' => $data['price'],
                    ]);
                }

                return response()->json([
                    'client_secret' => $paymentIntent->client_secret,
                    'order_id' => $order->id,
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Handle Stripe webhook events.
     * This endpoint is PUBLIC (no Sanctum auth) — Stripe calls it directly.
     * Verifies the webhook signature, then updates order payment_status accordingly.
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            if ($secret) {
                // Verify signature if webhook secret is configured
                $event = Webhook::constructEvent($payload, $sigHeader, $secret);
            } else {
                // No webhook secret — parse payload directly (dev/test mode)
                $event = \Stripe\Event::constructFrom(
                    json_decode($payload, true)
                );
            }
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }


        switch ($event->type) {
            case 'payment_intent.succeeded':
                $pi = $event->data->object;
                $order = Order::where('stripe_payment_intent_id', $pi->id)->first();
                if ($order && $order->payment_status !== 'paid') {
                    $order->payment_status = 'paid';
                    $order->status = 'confirmed';
                    $order->save();

                    if (!empty($order->phone)) {
                        $sms = new \App\Services\SmsService();
                        $message = "Hi {$order->first_name}, your payment for order #{$order->id} (LKR {$order->total_price}) was successful. Status: CONFIRMED.";
                        $sms->sendSms($order->phone, $message);
                    }

                    $existing = Transaction::where('order_id', $order->id)->first();
                    if (!$existing) {
                        Transaction::create([
                            'order_id' => $order->id,
                            'amount' => $order->total_price,
                            'payment_method' => 'card',
                            'status' => 'completed',
                            'reference_number' => $pi->id,
                        ]);
                    }

                    // Deduct stock now that payment is confirmed
                    foreach ($order->items as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->quantity = max(0, $product->quantity - $item->quantity);
                            $product->save();
                        }
                    }
                }
                break;

            case 'payment_intent.payment_failed':
                $pi = $event->data->object;
                $order = Order::where('stripe_payment_intent_id', $pi->id)->first();
                if ($order) {
                    $order->payment_status = 'failed';
                    $order->save();
                }
                break;
        }

        return response()->json(['status' => 'ok']);
    }
}
