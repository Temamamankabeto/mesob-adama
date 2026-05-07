<?php

namespace App\Http\Controllers\Api\Public;

use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\PublicServiceService;

class PublicServiceController extends Controller
{
    protected PublicServiceService
        $publicServiceService;

    public function __construct(
        PublicServiceService
            $publicServiceService
    ) {
        $this->publicServiceService =
            $publicServiceService;
    }

    /**
     * List public services.
     */
    public function index(Request $request)
    {
        $services =
            $this->publicServiceService
                ->getAll($request);

        return response()->json([

            'success' => true,

            'message' =>
                'Services retrieved successfully',

            'data' => $services,
        ]);
    }

    /**
     * Featured services.
     */
    public function featured()
    {
        $services =
            $this->publicServiceService
                ->featured();

        return response()->json([

            'success' => true,

            'message' =>
                'Featured services retrieved successfully',

            'data' => $services,
        ]);
    }

    /**
     * Show service.
     */
    public function show(Service $service)
    {
        return response()->json([

            'success' => true,

            'message' =>
                'Service retrieved successfully',

            'data' => $service->load('windows'),
        ]);
    }
}