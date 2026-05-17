<?php

namespace App\Services;

use App\Models\Service;
use App\Models\Window;
use App\Services\Concerns\ChecksServiceAvailability;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PublicServiceService
{
    use ChecksServiceAvailability;

    public function getAll(Request $request)
    {
        $query = Service::query()
            ->where('status', 'active');

        if ($request->filled('search')) {
            $query->where(function (Builder $query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $services = $query
            ->latest()
            ->get()
            ->filter(fn (Service $service) => $this->matchesRequestAvailability($service, $request))
            ->values();

        $perPage = max((int) ($request->per_page ?? 12), 1);
        $page = max((int) ($request->page ?? 1), 1);

        return new LengthAwarePaginator(
            $services->forPage($page, $perPage)->values(),
            $services->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );
    }

    public function featured()
    {
        return Service::query()
            ->where('status', 'active')
            ->latest()
            ->take(6)
            ->get();
    }

    public function groupByWindow(Request $request)
    {
        $windows = Window::with([
            'services' => function ($query) {
                $query->where('status', 'active')
                    ->with([
                        'windows' => function ($windowQuery) {
                            $windowQuery->orderBy('service_window.step_order');
                        },
                    ]);
            },
        ])
            ->latest()
            ->get();

        $assignedServiceIds = [];

        $windows->transform(function ($window) use (&$assignedServiceIds, $request) {
            $filteredServices = $window->services
                ->filter(function ($service) use ($window, &$assignedServiceIds, $request) {
                    if (in_array($service->id, $assignedServiceIds, true)) {
                        return false;
                    }

                    if (!$this->matchesRequestAvailability($service, $request)) {
                        return false;
                    }

                    $firstWindow = $service->windows
                        ->sortBy('pivot.step_order')
                        ->first();

                    if (!$firstWindow || $firstWindow->id !== $window->id) {
                        return false;
                    }

                    $assignedServiceIds[] = $service->id;

                    return true;
                })
                ->values();

            $window->setRelation('services', $filteredServices);

            return $window;
        });

        return $windows
            ->filter(fn ($window) => $window->services->count() > 0)
            ->values();
    }

    private function matchesRequestAvailability(Service $service, Request $request): bool
    {
        $level = $request->input('administrative_level') ?? $request->input('level');

        if (!$level) {
            return false;
        }

        $level = strtolower((string) $level);

        return $this->serviceIsAvailableForSelection(
            $service,
            $level,
            $request->filled('city_id') ? $request->integer('city_id') : null,
            $request->filled('subcity_id') ? $request->integer('subcity_id') : null,
            $request->filled('woreda_id') ? $request->integer('woreda_id') : null
        );
    }
}
