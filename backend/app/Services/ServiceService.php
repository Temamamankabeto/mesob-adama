<?php

namespace App\Services;

use App\Models\Service;

class ServiceService
{
    public function getAll()
    {
        return Service::latest()->paginate(200);
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