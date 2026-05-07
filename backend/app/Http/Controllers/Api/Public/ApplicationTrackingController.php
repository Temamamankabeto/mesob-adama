<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\TrackApplicationRequest;
use App\Services\ApplicationTrackingService;

class ApplicationTrackingController
    extends Controller
{
    protected ApplicationTrackingService
        $trackingService;

    public function __construct(
        ApplicationTrackingService
            $trackingService
    ) {
        $this->trackingService =
            $trackingService;
    }

    /**
     * Track application.
     */
    public function track(
        TrackApplicationRequest $request
    ) {
        $application =
            $this->trackingService
                ->track(
                    $request->application_number
                );

        if (!$application) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Application not found',

            ], 404);
        }

        return response()->json([

            'success' => true,

            'message' =>
                'Application retrieved successfully',

            'data' => $application,
        ]);
    }
}