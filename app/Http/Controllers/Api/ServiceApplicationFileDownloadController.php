<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplicationFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ServiceApplicationFileDownloadController extends Controller
{
    public function download(Request $request, ServiceApplicationFile $file)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $file->loadMissing([
            'application.customer',
            'application.histories',
            'application.shares',
        ]);

        if (! $this->canAccessFile($user, $file)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to access this file.',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $file->path) {
            return response()->json([
                'success' => false,
                'message' => 'File path is missing.',
            ], Response::HTTP_NOT_FOUND);
        }

        $path = ltrim((string) $file->path, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        if (! Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $downloadName = $file->original_name ?: basename($path);

        return Storage::disk('public')
            ->response($path, $downloadName, [
                'Content-Type' => $file->mime_type ?: Storage::disk('public')->mimeType($path) ?: 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store, no-cache, must-revalidate',
            ]);
    }

    private function canAccessFile($user, ServiceApplicationFile $file): bool
    {
        $application = $file->application;

        if (! $application) {
            return false;
        }

        $userId = (int) $user->id;

        $ownerIds = [
            (int) ($application->customer_id ?? 0),
            (int) ($application->created_by ?? 0),
            (int) ($application->user_id ?? 0),
        ];

        if (in_array($userId, $ownerIds, true)) {
            return true;
        }

        if (
            $application->customer &&
            (
                ($user->email && $application->customer->email && strtolower($user->email) === strtolower($application->customer->email)) ||
                ($user->phone && $application->customer->phone && $user->phone === $application->customer->phone)
            )
        ) {
            return true;
        }

        if ((int) ($application->current_officer_id ?? 0) === $userId) {
            return true;
        }

        if ((int) ($application->assigned_to ?? 0) === $userId) {
            return true;
        }

        if (
            $application->histories &&
            $application->histories->contains(function ($history) use ($userId) {
                return (int) ($history->actor_id ?? 0) === $userId ||
                    (int) ($history->from_user_id ?? 0) === $userId ||
                    (int) ($history->to_user_id ?? 0) === $userId;
            })
        ) {
            return true;
        }

        if (
            $application->shares &&
            $application->shares->contains(function ($share) use ($userId) {
                return (int) ($share->shared_with_user_id ?? 0) === $userId ||
                    (int) ($share->shared_by_user_id ?? 0) === $userId;
            })
        ) {
            return true;
        }

        foreach ([
            'service_applications.read',
            'applications.read',
            'applications.summary',
            'applications.manage',
        ] as $permission) {
            if (method_exists($user, 'can') && $user->can($permission)) {
                return true;
            }
        }

        return false;
    }
}
