<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\PublicQueueDisplayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class PublicQueueDisplayController extends Controller
{
    public function __construct(private readonly PublicQueueDisplayService $display) {}

    public function index(Request $request): JsonResponse
    {
        $input = $request->validate([
            'administrative_level' => ['required', Rule::in(['city', 'subcity', 'woreda'])],
            'city_id' => ['required', 'integer', 'min:1', 'exists:cities,id'],
            'subcity_id' => ['nullable', 'integer', 'min:1', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'min:1', 'exists:woredas,id'],
            'after_event_id' => ['nullable', 'integer', 'min:0'],
        ]);

        $level = $input['administrative_level'];
        $city = (int) $input['city_id'];
        $subcity = isset($input['subcity_id']) ? (int) $input['subcity_id'] : null;
        $woreda = isset($input['woreda_id']) ? (int) $input['woreda_id'] : null;

        if (($level === 'city' && ($subcity !== null || $woreda !== null))
            || ($level === 'subcity' && ($subcity === null || $woreda !== null))
            || ($level === 'woreda' && ($subcity === null || $woreda === null))) {
            throw ValidationException::withMessages(['location' => ['Invalid office location scope.']]);
        }
        if ($subcity !== null && ! DB::table('subcities')->where('id', $subcity)->where('city_id', $city)->exists()) {
            throw ValidationException::withMessages(['subcity_id' => ['Subcity does not belong to the selected city.']]);
        }
        if ($woreda !== null && ! DB::table('woredas')->where('id', $woreda)->where('subcity_id', $subcity)->exists()) {
            throw ValidationException::withMessages(['woreda_id' => ['Woreda does not belong to the selected subcity.']]);
        }

        $scope = [
            'administrative_level' => $level,
            'city_id' => $city,
            'subcity_id' => $subcity,
            'woreda_id' => $woreda,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Public queue retrieved successfully.',
            'data' => $this->display->get($scope, isset($input['after_event_id']) ? (int) $input['after_event_id'] : null),
            'meta' => ['refresh_interval_seconds' => 3],
        ]);
    }
}
