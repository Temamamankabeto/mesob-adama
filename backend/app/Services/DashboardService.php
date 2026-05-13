<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\ServiceForm;
use App\Models\User;
use App\Support\AccessScope;
use App\Support\AppRoles;

class DashboardService
{
    public function __construct(
        protected AccessScope $scope
    ) {}

    public function overview(User $user): array
    {
        $role = $user->getRoleNames()->first() ?: AppRoles::CUSTOMER;
        $permissions = $user->getAllPermissions()->pluck('name')->values()->all();

        $serviceApplications = ServiceApplication::query();
        $this->scope->applyServiceApplicationScope($serviceApplications, $user);

        $applications = Application::query();
        $this->scope->applyApplicationScope($applications, $user);

        $users = User::query();
        $this->scope->applyUserScope($users, $user);

        return [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $role,
                'role_label' => AppRoles::labels()[$role] ?? $role,
                'location_level' => AppRoles::userLevel($user),
                'scope_label' => $this->scope->scopeLabel($user),
                'city' => $user->city?->name,
                'subcity' => $user->subcity?->name,
                'woreda' => $user->woreda?->name,
            ],
            'permissions' => $permissions,
            'cards' => $this->cardsFor($user, clone $serviceApplications, clone $applications, clone $users),
            'status_counts' => $this->statusCounts(clone $serviceApplications),
            'quick_links' => $this->quickLinksFor($role, $permissions),
        ];
    }

    protected function cardsFor(User $user, $serviceApplications, $applications, $users): array
    {
        if ($user->hasRole(AppRoles::CUSTOMER)) {
            return [
                [
                    'key' => 'my_applications',
                    'label' => 'My Applications',
                    'value' => (clone $serviceApplications)->count(),
                    'description' => 'Submitted service applications.',
                ],
                [
                    'key' => 'pending',
                    'label' => 'Pending',
                    'value' => (clone $serviceApplications)->whereIn('status', ['submitted', 'under_review'])->count(),
                    'description' => 'Applications waiting for processing.',
                ],
                [
                    'key' => 'approved',
                    'label' => 'Approved',
                    'value' => (clone $serviceApplications)->where('status', 'approved')->count(),
                    'description' => 'Approved applications.',
                ],
                [
                    'key' => 'completed',
                    'label' => 'Completed',
                    'value' => (clone $serviceApplications)->where('status', 'completed')->count(),
                    'description' => 'Completed applications.',
                ],
            ];
        }

        if ($user->hasAnyRole([AppRoles::FRONT_OFFICER, AppRoles::BACK_OFFICER])) {
            return [
                [
                    'key' => 'queue',
                    'label' => 'Queue',
                    'value' => (clone $serviceApplications)->whereIn('status', ['submitted', 'under_review', 'returned'])->count(),
                    'description' => 'Applications requiring officer action.',
                ],
                [
                    'key' => 'under_review',
                    'label' => 'Under Review',
                    'value' => (clone $serviceApplications)->where('status', 'under_review')->count(),
                    'description' => 'Applications in review.',
                ],
                [
                    'key' => 'returned',
                    'label' => 'Returned',
                    'value' => (clone $serviceApplications)->where('status', 'returned')->count(),
                    'description' => 'Returned for correction.',
                ],
                [
                    'key' => 'completed',
                    'label' => 'Completed',
                    'value' => (clone $serviceApplications)->where('status', 'completed')->count(),
                    'description' => 'Processed applications.',
                ],
            ];
        }

        return [
            [
                'key' => 'users',
                'label' => 'Users',
                'value' => (clone $users)->count(),
                'description' => 'Users inside your access scope.',
            ],
            [
                'key' => 'services',
                'label' => 'Services',
                'value' => Service::count(),
                'description' => 'Configured services.',
            ],
            [
                'key' => 'forms',
                'label' => 'Forms',
                'value' => ServiceForm::count(),
                'description' => 'Dynamic service forms.',
            ],
            [
                'key' => 'applications',
                'label' => 'Applications',
                'value' => (clone $serviceApplications)->count(),
                'description' => 'Service applications inside your scope.',
            ],
        ];
    }

    protected function statusCounts($query): array
    {
        return [
            'total' => (clone $query)->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'under_review' => (clone $query)->where('status', 'under_review')->count(),
            'returned' => (clone $query)->where('status', 'returned')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
        ];
    }

    protected function quickLinksFor(string $role, array $permissions): array
    {
        $links = [
            [
                'label' => 'Users',
                'href' => '/dashboard/users',
                'permission' => 'users.read',
            ],
            [
                'label' => 'Form Builder',
                'href' => '/dashboard/service-forms',
                'permission' => 'service_forms.read',
            ],
            [
                'label' => 'Applications',
                'href' => '/dashboard/service-applications',
                'permission' => 'service_applications.read',
            ],
            [
                'label' => 'Officer Queue',
                'href' => '/dashboard/officer/applications',
                'permission' => 'service_applications.review',
            ],
            [
                'label' => 'My Applications',
                'href' => '/my-applications',
                'permission' => 'applications.own',
            ],
            [
                'label' => 'Track Application',
                'href' => '/track-application',
                'permission' => 'applications.track',
            ],
        ];

        return collect($links)
            ->filter(fn (array $link) => in_array($link['permission'], $permissions, true))
            ->values()
            ->all();
    }
}
