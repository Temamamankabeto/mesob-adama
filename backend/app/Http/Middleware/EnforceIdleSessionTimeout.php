<?php

namespace App\Http\Middleware;

use App\Support\AppRoles;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceIdleSessionTimeout
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if (property_exists($user, 'is_active') || array_key_exists('is_active', $user->getAttributes())) {
            if (!$user->is_active) {
                $user->tokens()->delete();

                return response()
                    ->json([
                        'success' => false,
                        'message' => 'Your account is disabled. Please contact the administrator.',
                        'data' => null,
                        'meta' => null,
                    ], 403)
                    ->withoutCookie('refresh_token');
            }
        }

        $token = $user->currentAccessToken();

        if (!$token) {
            return $next($request);
        }

        $lastUsedAt = $token->last_used_at;
        $timeoutMinutes = $this->timeoutMinutes($user);

        if ($lastUsedAt && $lastUsedAt->copy()->addMinutes($timeoutMinutes)->isPast()) {
            $token->delete();

            return response()
                ->json([
                    'success' => false,
                    'message' => 'Session expired because of inactivity. Please login again.',
                    'data' => null,
                    'meta' => ['idle_timeout_minutes' => $timeoutMinutes],
                ], 401)
                ->withoutCookie('refresh_token');
        }

        $token->forceFill(['last_used_at' => now()])->save();

        return $next($request);
    }

    protected function timeoutMinutes($user): int
    {
        $role = AppRoles::normalize($user->roles()->pluck('name')->first());

        if (in_array($role, [AppRoles::SUPER_ADMIN, AppRoles::ADMIN], true)) {
            return (int) env('PRIVILEGED_IDLE_TIMEOUT_MINUTES', 15);
        }

        return (int) env('IDLE_TIMEOUT_MINUTES', 30);
    }
}
