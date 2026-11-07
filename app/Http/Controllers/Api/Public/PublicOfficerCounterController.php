<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\PublicOfficerCounterService;
use Illuminate\Http\JsonResponse;

final class PublicOfficerCounterController extends Controller
{
    public function __construct(private readonly PublicOfficerCounterService $counters) {}

    public function show(string $officerCode): JsonResponse
    {
        $data = $this->counters->get($officerCode);

        if ($data === null) {
            return response()->json([
                'success' => false,
                'message' => 'Officer counter not found.',
                'data' => null,
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Officer counter retrieved successfully.',
            'data' => $data,
            'meta' => ['refresh_interval_seconds' => 3],
        ]);
    }
}
