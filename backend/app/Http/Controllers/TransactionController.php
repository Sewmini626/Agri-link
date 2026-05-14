<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Order;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions (admin only).
     */
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Transaction::with('order')->get();
    }

    /**
     * Store a new transaction (payment record) for an order.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bank_transfer,mobile_payment',
            'reference_number' => 'nullable|string',
        ]);

        // Verify the order belongs to the authenticated user
        $order = Order::findOrFail($fields['order_id']);

        if (auth()->id() !== (string) $order->user_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent duplicate transactions for the same order
        $existing = Transaction::where('order_id', $fields['order_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'Transaction already exists for this order'], 422);
        }

        $transaction = Transaction::create([
            'order_id' => $fields['order_id'],
            'amount' => $fields['amount'],
            'payment_method' => $fields['payment_method'],
            'status' => 'completed',
            'reference_number' => $fields['reference_number'] ?? null,
        ]);

        // Update order status to confirmed after payment
        $order->status = 'confirmed';
        $order->save();

        return response()->json($transaction->load('order'), 201);
    }

    /**
     * Display the specified transaction.
     */
    public function show($id)
    {
        $transaction = Transaction::with('order')->findOrFail($id);

        $order = $transaction->order;
        if (auth()->id() !== (string) $order->user_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $transaction;
    }

    /**
     * Update transaction status (admin only).
     */
    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::findOrFail($id);

        $fields = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
        ]);

        $transaction->status = $fields['status'];
        $transaction->save();

        return response()->json($transaction, 200);
    }

    /**
     * Delete a transaction (admin only).
     */
    public function destroy($id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted'], 200);
    }
}
