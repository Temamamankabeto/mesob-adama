<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Service;
use App\Models\Window;

use App\Policies\ServicePolicy;
use App\Policies\WindowPolicy;

use Illuminate\Support\Facades\Gate;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Policy mappings.
     */
    protected $policies = [

        Service::class => ServicePolicy::class,

        Window::class => WindowPolicy::class,

    ];

    /**
     * Register services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        /*
        |--------------------------------------------------------------------------
        | Dashboard Gates
        |--------------------------------------------------------------------------
        */

        Gate::define(
            'dashboard.waiter',
            fn (User $user) =>
                $user->can('dashboard.waiter')
        );

        Gate::define(
            'dashboard.admin',
            fn (User $user) =>
                $user->can('dashboard.admin')
        );

        Gate::define(
            'dashboard.customer',
            fn (User $user) =>
                $user->can('dashboard.customer')
        );
    }
}