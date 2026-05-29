<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $baseUrl;
    protected string $sendPath;
    protected string $token;
    protected string $method;
    protected string $phoneField;
    protected string $messageField;
    protected string $tokenField;
    protected string $tokenType;
    protected string $tokenLocation;
    protected string $senderField;
    protected string $sender;
    protected bool $enabled;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('sms.base_url', ''), '/');
        $this->sendPath = '/' . ltrim((string) config('sms.send_path', '/api/send-sms'), '/');
        $this->token = (string) config('sms.token', '');
        $this->method = strtolower((string) config('sms.method', 'post'));
        $this->phoneField = (string) config('sms.phone_field', 'phone');
        $this->messageField = (string) config('sms.message_field', 'message');
        $this->tokenField = (string) config('sms.token_field', 'token');
        $this->tokenType = (string) config('sms.token_type', 'Bearer');
        $this->tokenLocation = strtolower((string) config('sms.token_location', 'header'));
        $this->senderField = (string) config('sms.sender_field', 'sender');
        $this->sender = (string) config('sms.sender', 'MESOB');
        $this->enabled = (bool) config('sms.enabled', true);
    }

    public function sendToPhone(string $phone, string $message): bool
    {
        if (!$this->enabled) {
            Log::info('SMS skipped: SMS disabled.', compact('phone', 'message'));
            return false;
        }

        if (blank($this->baseUrl) || blank($this->token)) {
            Log::warning('SMS skipped: SMS base URL or token missing.', [
                'base_url_configured' => filled($this->baseUrl),
                'token_configured' => filled($this->token),
            ]);

            return false;
        }

        $url = $this->baseUrl . $this->sendPath;

        $payload = [
            $this->phoneField => $this->normalizePhone($phone),
            $this->messageField => $message,
        ];

        if (filled($this->sender)) {
            $payload[$this->senderField] = $this->sender;
        }

        if ($this->tokenLocation === 'body' || $this->tokenLocation === 'query') {
            $payload[$this->tokenField] = $this->token;
        }

        try {
            $client = Http::acceptJson()
                ->timeout(30)
                ->retry(2, 300);

            if ($this->tokenLocation === 'header') {
                $client = $client->withToken($this->token, $this->tokenType);
            }

            $response = $this->method === 'get'
                ? $client->get($url, $payload)
                : $client->post($url, $payload);

            if (!$response->successful()) {
                Log::warning('SMS sending failed.', [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'payload_keys' => array_keys($payload),
                ]);

                return false;
            }

            Log::info('SMS sent successfully.', [
                'url' => $url,
                'phone' => $this->normalizePhone($phone),
                'status' => $response->status(),
            ]);

            return true;
        } catch (\Throwable $exception) {
            Log::error('SMS exception: ' . $exception->getMessage(), [
                'url' => $url,
                'phone' => $phone,
            ]);

            return false;
        }
    }

    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', trim($phone));

        // Keep Ethiopian local 09... unless provider requires +251.
        // If Dagu requires international format, change here to return +251...
        return $phone;
    }
}
