<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserQrCredentialController extends Controller
{
    // QR-only credentials are bearer secrets. Reading or printing requires users.update,
    // not the broader users.read permission.
    public function show(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $credential = DB::table('user_qr_credentials')->where('user_id', $user->id)->first();
        $active = $credential && $user->is_active && !$user->trashed() && now()->lt($credential->expires_at);
        $plaintext = null;
        if ($active && $credential->encrypted_token) {
            $plaintext = Crypt::decryptString($credential->encrypted_token);
        }
        Log::info('MESOB QR credential viewed', ['user_id' => $user->id, 'actor_id' => $request->user()->id]);

        return $this->response('QR credential status retrieved.', [
            'issued' => (bool) $credential,
            'active' => (bool) $active,
            'expires_at' => $credential?->expires_at,
            'last_used_at' => $credential?->last_used_at,
            'credential' => $plaintext,
            'reprint_available' => $plaintext !== null,
        ]);
    }

    public function issue(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        abort_unless($user->is_active && !$user->trashed(), 422, 'User must be active.');
        $data = $request->validate([
            'expires_at' => ['required', 'date', 'after:now'],
        ]);
        $expiry = \Illuminate\Support\Carbon::parse($data['expires_at']);
        $secret = 'mesobqr1.'.Str::random(80);
        DB::transaction(function () use ($user, $request, $secret, $expiry) {
            $existing = DB::table('user_qr_credentials')->where('user_id', $user->id)->first();
            $payload = [
                'token_hash' => hash('sha256', $secret),
                'encrypted_token' => Crypt::encryptString($secret),
                'expires_at' => $expiry,
                'last_used_at' => null,
                'issued_by' => $request->user()->id,
                'updated_at' => now(),
            ];
            if ($existing) {
                DB::table('user_qr_credentials')->where('user_id', $user->id)->update($payload);
            } else {
                DB::table('user_qr_credentials')->insert(array_merge($payload, [
                    'user_id' => $user->id, 'created_at' => now(),
                ]));
            }
        });
        Log::info('MESOB QR credential issued', [
            'user_id' => $user->id, 'actor_id' => $request->user()->id,
            'expires_at' => $expiry->toIso8601String(),
        ]);
        return $this->response('QR credential generated. Previous card invalidated.', [
            'credential' => $secret, 'expires_at' => $expiry->toIso8601String(),
        ]);
    }

    public function updateExpiry(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        $data = $request->validate(['expires_at' => ['required', 'date', 'after:now']]);
        $expiry = \Illuminate\Support\Carbon::parse($data['expires_at']);
        $updated = DB::table('user_qr_credentials')->where('user_id', $user->id)
            ->update(['expires_at' => $expiry, 'updated_at' => now()]);
        if (!$updated) {
            throw ValidationException::withMessages(['expires_at' => 'Generate a QR credential first.']);
        }
        Log::info('MESOB QR credential expiry updated', [
            'user_id' => $user->id, 'actor_id' => $request->user()->id,
            'expires_at' => $expiry->toIso8601String(),
        ]);
        return $this->response('QR expiration updated without changing the QR code.', [
            'expires_at' => $expiry->toIso8601String(),
        ]);
    }

    public function revoke(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);
        DB::table('user_qr_credentials')->where('user_id', $user->id)->delete();
        Log::info('MESOB QR credential revoked', [
            'user_id' => $user->id, 'actor_id' => $request->user()->id,
        ]);
        return $this->response('QR login revoked.', null);
    }

    private function response(string $message, mixed $data): JsonResponse
    {
        return response()->json([
            'success' => true, 'message' => $message,
            'data' => $data, 'meta' => (object) [],
        ])->header('Cache-Control', 'no-store, private');
    }
}
