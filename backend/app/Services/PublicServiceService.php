<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Http\Request;

class PublicServiceService
{
    /**
     * Get all services.
     */
    public function getAll(Request $request)
    {
        $query = Service::query()
            ->where('status', 'active');

        if ($request->search) {

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

    /**
     * Featured services.
     */
    public function featured()
    {
        return Service::where('status', 'active')
            ->latest()
            ->take(6)
            ->get();
    }
}