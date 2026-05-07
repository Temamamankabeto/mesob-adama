<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\HomepageService;

class HomeController extends Controller
{
    protected HomepageService $homepageService;

    public function __construct(
        HomepageService $homepageService
    ) {
        $this->homepageService =
            $homepageService;
    }

    /**
     * Homepage data.
     */
    public function index()
    {
        $data =
            $this->homepageService
                ->getHomepageData();

        return response()->json([

            'success' => true,

            'message' =>
                'Homepage data retrieved successfully',

            'data' => $data,
        ]);
    }
}