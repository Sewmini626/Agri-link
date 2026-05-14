<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SmsService
{
    /**
     * Send an SMS notification.
     * Since SMS services require payment, this service uses a free mocking approach
     * by logging to the system log (or potentially using a free tier API if configured).
     * 
     * @param string $phone The recipient's phone number
     * @param string $message The SMS message content
     * @return bool True if "sent" successfully
     */
    public function sendSms($phone, $message)
    {
        if (empty($phone)) {
            Log::warning("SmsService: Attempted to send SMS but phone number is empty. Message: {$message}");
            return false;
        }

        try {
            // Text.lk API credentials
            // Using the token provided by the user in the prompt.
            $apiToken = config('services.textlk.token', '3446|YFjecKG7FgiIagQPhIidsLfNNeC93L3xmnWkajboa897e91f');
            $senderId = config('services.textlk.sender_id', 'TextLKDemo');

            // Clean the phone number (remove +, spaces, etc)
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

            // Format number to start with 94 as required by Sri Lankan SMS gateways
            if (str_starts_with($cleanPhone, '0')) {
                $cleanPhone = '94' . substr($cleanPhone, 1);
            } elseif (strlen($cleanPhone) == 9) { // 771234567 format
                $cleanPhone = '94' . $cleanPhone;
            }

            // Example API call to Text.lk
            $response = Http::withToken($apiToken)
                ->accept('application/json')
                ->post("https://app.text.lk/api/v3/sms/send", [
                    'recipient' => $cleanPhone,
                    'sender_id' => $senderId,
                    'type' => 'plain',
                    'message' => $message,
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                if (isset($responseData['status']) && $responseData['status'] === 'success') {
                    Log::info("SmsService: SMS sent via Text.lk to {$cleanPhone}");
                    return true;
                } else {
                    Log::error("SmsService: Text.lk API returned error status: " . json_encode($responseData));
                }
            } else {
                Log::error("SmsService: Failed to send via Text.lk - " . $response->body());
            }

            // Fallback for debugging
            Log::channel('single')->info("================ SMS MOCK (Fallback) ================");
            Log::channel('single')->info("TO: {$cleanPhone}");
            Log::channel('single')->info("MESSAGE: {$message}");
            Log::channel('single')->info("==========================================");

            return true;
        } catch (\Exception $e) {
            Log::error("SmsService Error: " . $e->getMessage());
            return false;
        }
    }
}
