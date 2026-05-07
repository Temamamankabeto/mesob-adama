<?php

namespace App\Services;

use App\Models\Service;
use App\Models\Window;
use Illuminate\Http\Request;

class PublicServiceService
{
    /*
    |--------------------------------------------------------------------------
    | ALL SERVICES
    |--------------------------------------------------------------------------
    */

    public function getAll(Request $request)
    {
        $query = Service::query()
            ->where('status', 'active');

        if ($request->filled('search')) {

            $query->where(
                'name',
                'like',
                '%' . $request->search . '%'
            );
        }

        return $query
            ->latest()
            ->paginate(
                $request->per_page ?? 12
            );
    }

    /*
    |--------------------------------------------------------------------------
    | FEATURED SERVICES
    |--------------------------------------------------------------------------
    */

    public function featured()
    {
        return Service::query()
            ->where('status', 'active')
            ->latest()
            ->take(6)
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | GROUP SERVICES BY WINDOW
    |--------------------------------------------------------------------------
    */

    public function groupByWindow()
    {
        $windows = Window::with([

            'services' => function ($query) {

                $query->where(
                    'status',
                    'active'
                )
                ->with([
                    'windows' => function ($windowQuery) {

                        $windowQuery->orderBy(
                            'service_window.step_order'
                        );
                    }
                ]);
            }

        ])
        ->latest()
        ->get();

        /*
        |--------------------------------------------------------------------------
        | KEEP SERVICE ONLY IN FIRST WINDOW
        |--------------------------------------------------------------------------
        */

        $assignedServiceIds = [];

        $windows->transform(function ($window)
            use (&$assignedServiceIds)
        {

            $filteredServices = $window->services
                ->filter(function ($service)
                    use (
                        $window,
                        &$assignedServiceIds
                    )
                {

                    /*
                    |--------------------------------------------------------------------------
                    | SKIP IF ALREADY DISPLAYED
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $service->id,
                            $assignedServiceIds
                        )
                    ) {
                        return false;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | GET FIRST WORKFLOW WINDOW
                    |--------------------------------------------------------------------------
                    */

                    $firstWindow =
                        $service->windows
                            ->sortBy(
                                'pivot.step_order'
                            )
                            ->first();

                    /*
                    |--------------------------------------------------------------------------
                    | DISPLAY ONLY UNDER FIRST WINDOW
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !$firstWindow ||
                        $firstWindow->id !== $window->id
                    ) {
                        return false;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | MARK AS DISPLAYED
                    |--------------------------------------------------------------------------
                    */

                    $assignedServiceIds[] =
                        $service->id;

                    return true;
                })
                ->values();

            /*
            |--------------------------------------------------------------------------
            | REPLACE SERVICES COLLECTION
            |--------------------------------------------------------------------------
            */

            $window->setRelation(
                'services',
                $filteredServices
            );

            return $window;
        });

        /*
        |--------------------------------------------------------------------------
        | REMOVE EMPTY WINDOWS
        |--------------------------------------------------------------------------
        */

        return $windows
            ->filter(function ($window) {

                return
                    $window->services
                        ->count() > 0;
            })
            ->values();
    }
}