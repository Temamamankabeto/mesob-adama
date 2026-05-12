<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SmsService
{
    private string $baseUrl;
    private string $token;
    private string $senderId;

    public function __construct()
    {
        $this->baseUrl = env('SMS_API_BASE_URL');
        $this->token = env('SMS_API_TOKEN');
        $this->senderId = env('SMS_SENDER_ID');
    }

    public function sendToPhone(string $phone, string $message): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl . '/by-phone', [
            'senderID' => $this->senderId,
            'message' => $message,
            'phone' => $phone,
            'flash' => false,
        ]);

        return $response->successful();
    }

    public function sendOtp(string $phone, string $message): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->post($this->baseUrl . '/send-otp', [
            'senderID' => $this->senderId,
            'message' => $message,
            'phone' => $phone,
            'flash' => false,
        ]);

        return $response->successful();
    }
}