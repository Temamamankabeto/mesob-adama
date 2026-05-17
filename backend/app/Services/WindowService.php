<?php

namespace App\Services;

use App\Models\User;
use App\Models\Window;

class WindowService
{
    public function __construct(
        protected ServiceAvailabilityScopeService $scopeService
    ) {}

    public function getAll(?User $actor = null)
    {
        $query = Window::query()->latest();

        $this->scopeService->applyWindowScope($query, $actor);

        return $query->paginate(200);
    }

    public function create(array $data): Window
    {
        return Window::create($data);
    }

    public function update(Window $window, array $data): Window
    {
        $window->update($data);

        return $window->fresh();
    }

    public function delete(Window $window): bool
    {
        return $window->delete();
    }
}
