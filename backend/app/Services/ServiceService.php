<?php

namespace App\Services;

use App\Models\Service;
use App\Models\User;

class ServiceService
{
    public function __construct(
        protected ServiceAvailabilityScopeService $scopeService
    ) {}

    public function getAll(?User $actor = null)
    {
        $query = Service::query()
            ->with([
                'windows' => function ($query) {
                    $query
                        ->select([
                            'windows.id',
                            'windows.name',
                            'windows.title',
                            'windows.city_title',
                            'windows.subcity_title',
                            'windows.woreda_title',
                            'windows.administrative_level',
                            'windows.availability',
                        ])
                        ->orderBy('windows.name');
                },
            ])
            ->orderBy('id', 'asc');

        $this->scopeService->applyServiceScope($query, $actor);

        return $query->paginate(200);
    }

    public function create(array $data): Service
    {
        return Service::create($data)->fresh(['windows']);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);

        return $service->fresh(['windows']);
    }

    public function delete(Service $service): bool
    {
        return $service->delete();
    }
}
