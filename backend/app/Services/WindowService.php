<?php

namespace App\Services;

use App\Models\Window;

class WindowService
{
    /**
     * Get all windows.
     */
    public function getAll()
    {
        return Window::latest()->paginate(20);
    }

    /**
     * Create window.
     */
    public function create(array $data): Window
    {
        return Window::create($data);
    }

    /**
     * Update window.
     */
    public function update(
        Window $window,
        array $data
    ): Window {

        $window->update($data);

        return $window->fresh();
    }

    /**
     * Delete window.
     */
    public function delete(Window $window): bool
    {
        return $window->delete();
    }
}