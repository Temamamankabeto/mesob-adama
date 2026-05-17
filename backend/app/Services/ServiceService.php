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
            ->latest();

        $this->scopeService->applyServiceScope($query, $actor);

        return $query->paginate(200);
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);

        return $service->fresh();
    }

    public function delete(Service $service): bool
    {
        return $service->delete();
    }
}
