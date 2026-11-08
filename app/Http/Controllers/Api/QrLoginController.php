<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class QrLoginController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate(['credential' => ['required', 'string', 'max:128', 'regex:/^mesobqr1\.[A-Za-z0-9]{80}$/']]);
        $hash = hash('sha256', $validated['credential']);
        $record = DB::table('user_qr_credentials')->where('token_hash', $hash)->first();
        $user = $record ? User::find($record->user_id) : null;

        if (!$record || !$user || !$user->is_active || $user->trashed() ||
            now()->greaterThanOrEqualTo($record->expires_at) ||
            ($user->locked_until && now()->lessThan($user->locked_until))) {
            Log::warning('MESOB QR login rejected', ['ip' => $request->ip(), 'user_id' => $user?->id]);
            return response()->json(['success' => false, 'message' => 'QR code invalid, expired, or account unavailable.',
                'data' => null, 'meta' => (object) []], 401);
        }

        DB::transaction(function () use ($record, $user) {
            DB::table('user_qr_credentials')->where('id', $record->id)->update(['last_used_at' => now()]);
            $user->tokens()->delete();
        });
        $accessToken = $user->createToken('mesob-api-token', ['*'], now()->addMinutes(30))->plainTextToken;
        $refreshToken = Str::random(64);
        $user->forceFill([
            'refresh_token' => hash('sha256', $refreshToken),
            'refresh_token_expires_at' => now()->addDays(7),
            'last_login_at' => now(), 'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
        ])->save();
        Log::info('MESOB QR login successful', ['user_id' => $user->id, 'ip' => $request->ip()]);

        // Reuse the existing authentication response and refresh-cookie contract.
        return app(AuthController::class)->qrLoginResponse($request, $user, $accessToken, $refreshToken);
    }
}
