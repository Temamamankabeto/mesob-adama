<?php

namespace App\Services;

use App\Models\Service;
use App\Models\User;
use App\Models\Window;
use App\Models\Announcement;
use App\Models\Application;

class HomepageService
{
    /**
     * Get homepage data.
     */
    public function getHomepageData(): array
    {
        return [

            'hero' => [

                'title' =>
                    'Digital Government Services for Adama City',

                'subtitle' =>
                    'Apply, Track, and Manage Government Services Online',
            ],

            'statistics' => [

                'total_services' =>
                    Service::count(),

                'active_services' =>
                    Service::where(
                        'status',
                        'active'
                    )->count(),

                'total_windows' =>
                    Window::count(),

                'total_officers' =>
                    User::role([
                        'city_front_officer',
                        'city_back_officer',
                        'subcity_front_officer',
                        'subcity_back_officer',
                        'woreda_front_officer',
                        'woreda_back_officer',
                    ])->count(),

                'processed_applications' =>
                    Application::count(),
            ],

            'featured_services' =>
                Service::where('status', 'active')
                    ->latest()
                    ->take(6)
                    ->get(),

            'announcements' =>
                Announcement::latest()
                    ->take(5)
                    ->get(),
        ];
    }
}