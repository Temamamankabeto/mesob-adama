<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\ServiceApplicationAppointment;
use App\Models\ServiceForm;
use App\Models\User;
use App\Support\AccessScope;
use App\Support\AppRoles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'avatar_url' => $user->photo_url ?? $user->avatar_url ?? null,
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
            'status_counts' => $this->statusCounts(clone $serviceApplications, $user),
            'payment_counts' => $this->paymentCounts($user),
            'appointment_counts' => $this->appointmentCounts($user),
            'complaint_counts' => $this->complaintCounts($user),
            'quick_links' => $this->quickLinksFor($role, $permissions),
        ];
    }

    protected function cardsFor(User $user, $serviceApplications, $applications, $users): array
    {
        if ($user->hasRole(AppRoles::CUSTOMER)) {
            $status = $this->statusCounts(clone $serviceApplications, $user);

            return [
                [
                    'key' => 'total_application',
                    'label' => 'Total Application',
                    'value' => $status['total'],
                    'description' => 'All submitted service applications.',
                ],
                [
                    'key' => 'pending',
                    'label' => 'Pending',
                    'value' => $status['pending'],
                    'description' => 'Applications waiting for processing.',
                ],
                [
                    'key' => 'approved',
                    'label' => 'Approved',
                    'value' => $status['approved'],
                    'description' => 'Approved applications.',
                ],
                [
                    'key' => 'rejected',
                    'label' => 'Rejected',
                    'value' => $status['rejected'],
                    'description' => 'Rejected applications.',
                ],
            ];
        }

        if ($user->hasAnyRole([AppRoles::FRONT_OFFICER, AppRoles::BACK_OFFICER])) {
            return [
                [
                    'key' => 'queue',
                    'label' => 'Queue',
                    'value' => (clone $serviceApplications)->whereIn('status', ['submitted', 'front_officer_review', 'forwarded_to_back_officer', 'back_officer_review', 'returned'])->count(),
                    'description' => 'Applications requiring officer action.',
                ],
                [
                    'key' => 'under_review',
                    'label' => 'Under Review',
                    'value' => (clone $serviceApplications)->whereIn('status', ['front_officer_review', 'back_officer_review'])->count(),
                    'description' => 'Applications in review.',
                ],
                [
                    'key' => 'returned',
                    'label' => 'Appointed',
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

    protected function statusCounts($query, ?User $user = null): array
    {
        $pendingStatuses = [
            'draft', 'submitted', 'pending', 'accepted', 'under_review',
            'front_officer_review', 'appointment_scheduled', 'shared',
            'shared_to_front_officer', 'shared_to_back_officer',
            'returned_from_share', 'forwarded_to_back_officer',
            'back_officer_review', 'under_back_review', 'returned',
            'returned_to_customer', 'returned_to_front_officer',
            'returned_to_back_officer', 'resubmitted', 'escalated',
            'escalated_to_manager', 'manager_review', 'manager_assigned',
            'assigned_by_manager', 'manager_returned', 'returned_to_manager',
            'manager_forwarded',
        ];

        return [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->whereIn('status', $pendingStatuses)->count(),
            'approved' => (clone $query)->whereIn('status', ['approved', 'back_officer_approved', 'manager_resolved'])->count(),
            'rejected' => (clone $query)->whereIn('status', ['rejected', 'back_officer_rejected', 'cancelled'])->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'under_review' => (clone $query)->whereIn('status', ['front_officer_review', 'forwarded_to_back_officer', 'back_officer_review', 'under_review', 'manager_review'])->count(),
            'appointed' => (clone $query)->whereIn('status', ['appointment_scheduled'])->count(),
            'completed' => (clone $query)->whereIn('status', ['completed', 'closed'])->count(),
        ];
    }

    protected function paymentCounts(User $user): array
    {
        if (! Schema::hasTable('payments')) {
            return ['pending' => 0, 'paid' => 0];
        }

        $query = DB::table('payments');

        if (Schema::hasColumn('payments', 'user_id')) {
            $query->where('user_id', $user->id);
        } elseif (Schema::hasColumn('payments', 'customer_id')) {
            $query->where('customer_id', $user->id);
        }

        return [
            'pending' => (clone $query)->whereIn('status', ['pending', 'unpaid', 'waiting'])->count(),
            'paid' => (clone $query)->whereIn('status', ['paid', 'completed', 'success'])->count(),
        ];
    }

    protected function appointmentCounts(User $user): array
    {
        if (! Schema::hasTable('service_application_appointments')) {
            return ['total' => 0, 'upcoming' => 0];
        }

        $applicationIds = ServiceApplication::query()
            ->where('customer_id', $user->id)
            ->pluck('id');

        $query = ServiceApplicationAppointment::query()
            ->whereIn('application_id', $applicationIds);

        return [
            'total' => (clone $query)->count(),
            'upcoming' => (clone $query)
                ->where('appointment_at', '>=', now())
                ->whereIn('status', ['scheduled', 'pending', 'confirmed'])
                ->count(),
        ];
    }

    protected function complaintCounts(User $user): array
    {
        foreach (['complaints', 'feedback', 'complaints_feedback'] as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $query = DB::table($table);

            if (Schema::hasColumn($table, 'user_id')) {
                $query->where('user_id', $user->id);
            } elseif (Schema::hasColumn($table, 'customer_id')) {
                $query->where('customer_id', $user->id);
            }

            return [
                'total' => (clone $query)->count(),
                'open' => Schema::hasColumn($table, 'status')
                    ? (clone $query)->whereIn('status', ['open', 'pending', 'new'])->count()
                    : 0,
            ];
        }

        return ['total' => 0, 'open' => 0];
    }

    protected function quickLinksFor(string $role, array $permissions): array
    {
        $links = [
            ['label' => 'Users', 'href' => '/dashboard/users', 'permission' => 'users.read'],
            ['label' => 'Form Builder', 'href' => '/dashboard/service-forms', 'permission' => 'service_forms.read'],
            ['label' => 'Applications', 'href' => '/dashboard/service-applications', 'permission' => 'service_applications.read'],
            ['label' => 'Officer Queue', 'href' => '/dashboard/officer/applications', 'permission' => 'service_applications.review'],
            ['label' => 'New Application', 'href' => '/services', 'permission' => 'applications.own'],
            ['label' => 'Total Application', 'href' => '/dashboard/my-applications', 'permission' => 'applications.own'],
            ['label' => 'Pending', 'href' => '/dashboard/my-applications?status=pending', 'permission' => 'applications.own'],
            ['label' => 'Approved', 'href' => '/dashboard/my-applications?status=approved', 'permission' => 'applications.own'],
            ['label' => 'Rejected', 'href' => '/dashboard/my-applications?status=rejected', 'permission' => 'applications.own'],
            ['label' => 'Appointments', 'href' => '/dashboard/appointments', 'permission' => 'applications.own'],
            ['label' => 'Payments', 'href' => '/dashboard/payments', 'permission' => 'applications.own'],
            ['label' => 'Complaints & Feedback', 'href' => '/dashboard/complaints-feedback', 'permission' => 'applications.own'],
            ['label' => 'Help & Support', 'href' => '/dashboard/help-support', 'permission' => 'applications.own'],
        ];

        return collect($links)
            ->filter(fn (array $link) => in_array($link['permission'], $permissions, true))
            ->values()
            ->all();
    }
}
