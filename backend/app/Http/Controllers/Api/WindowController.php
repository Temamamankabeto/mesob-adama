<?php

namespace App\Http\Controllers\Api;

use App\Models\Window;
use App\Services\WindowService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWindowRequest;
use App\Http\Requests\UpdateWindowRequest;

class WindowController extends Controller
{
    protected WindowService $windowService;

    public function __construct(
        WindowService $windowService
    ) {
        $this->windowService = $windowService;
    }

    /**
     * List windows.
     */
    public function index()
    {
        $this->authorize(
            'viewAny',
            Window::class
        );

        $windows = $this->windowService
            ->getAll();

        return response()->json([
            'success' => true,

            'message' =>
                'Windows retrieved successfully',

            'data' => $windows,
        ]);
    }

    /**
     * Store window.
     */
    public function store(
        StoreWindowRequest $request
    ) {

        $this->authorize(
            'create',
            Window::class
        );

        $window = $this->windowService
            ->create(
                $request->validated()
            );

        return response()->json([
            'success' => true,

            'message' =>
                'Window created successfully',

            'data' => $window,
        ], 201);
    }

    /**
     * Update window.
     */
    public function update(
        UpdateWindowRequest $request,
        Window $window
    ) {

        $this->authorize(
            'update',
            $window
        );

        $updatedWindow =
            $this->windowService->update(
                $window,
                $request->validated()
            );

        return response()->json([
            'success' => true,

            'message' =>
                'Window updated successfully',

            'data' => $updatedWindow,
        ]);
    }

    /**
     * Delete window.
     */
    public function destroy(
        Window $window
    ) {

        $this->authorize(
            'delete',
            $window
        );

        $this->windowService->delete(
            $window
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Window deleted successfully',
        ]);
    }
}