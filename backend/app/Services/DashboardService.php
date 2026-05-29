<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\ServiceApplicationAppointment;
use App\Models\ServiceForm;
use App\Models\ServiceFormField;
use App\Models\ServiceFormSection;
use App\Models\User;
use App\Models\Window;
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

        $statusCounts = $this->statusCounts(clone $serviceApplications, $user);

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
            'cards' => $this->cardsFor($user, clone $serviceApplications, clone $applications, clone $users, $statusCounts),
            'status_counts' => $statusCounts,
            'module_counts' => $this->moduleCounts($user, clone $serviceApplications, clone $users),
            'payment_counts' => $this->paymentCounts($user),
            'appointment_counts' => $this->appointmentCounts($user, clone $serviceApplications),
            'complaint_counts' => $this->complaintCounts($user),
            'quick_links' => $this->quickLinksFor($role, $permissions),
            'recent_applications' => $this->recentApplications(clone $serviceApplications),
            'recent_users' => $this->recentUsers(clone $users),
        ];
    }

    protected function cardsFor(User $user, $serviceApplications, $applications, $users, array $status): array
    {
        if ($user->hasRole(AppRoles::CUSTOMER)) {
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
                    'value' => (clone $serviceApplications)->whereIn('status', [
                        'submitted',
                        'resubmitted',
                        'shared_to_front_officer',
                        'shared_to_back_officer',
                        'front_officer_review',
                        'forwarded_to_back_officer',
                        'back_officer_review',
                        'under_back_review',
                        'returned_to_front_officer',
                        'returned_to_back_officer',
                        'appointment_scheduled',
                    ])->count(),
                    'description' => 'Applications requiring officer action.',
                ],
                [
                    'key' => 'under_review',
                    'label' => 'Under Review',
                    'value' => $status['under_review'],
                    'description' => 'Applications in review.',
                ],
                [
                    'key' => 'appointed',
                    'label' => 'Appointed',
                    'value' => $status['appointed'],
                    'description' => 'Scheduled customer appointments.',
                ],
                [
                    'key' => 'completed',
                    'label' => 'Completed',
                    'value' => $status['completed'],
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
                'key' => 'active_services',
                'label' => 'Active Services',
                'value' => Schema::hasColumn('services', 'status') ? Service::where('status', 'active')->count() : Service::count(),
                'description' => 'Services currently available.',
            ],
            [
                'key' => 'forms',
                'label' => 'Forms',
                'value' => ServiceForm::count(),
                'description' => 'Dynamic service forms.',
            ],
            [
                'key' => 'windows',
                'label' => 'Windows',
                'value' => class_exists(Window::class) ? Window::count() : 0,
                'description' => 'Configured service windows.',
            ],
            [
                'key' => 'applications',
                'label' => 'Applications',
                'value' => $status['total'],
                'description' => 'Service applications inside your scope.',
            ],
            [
                'key' => 'submitted',
                'label' => 'Submitted',
                'value' => $status['submitted'],
                'description' => 'Newly submitted applications.',
            ],
            [
                'key' => 'under_review',
                'label' => 'Under Review',
                'value' => $status['under_review'],
                'description' => 'Applications currently being processed.',
            ],
            [
                'key' => 'appointed',
                'label' => 'Appointed',
                'value' => $status['appointed'],
                'description' => 'Applications with appointments.',
            ],
            [
                'key' => 'completed',
                'label' => 'Completed',
                'value' => $status['completed'],
                'description' => 'Completed and closed applications.',
            ],
            [
                'key' => 'rejected',
                'label' => 'Rejected',
                'value' => $status['rejected'],
                'description' => 'Rejected or cancelled applications.',
            ],
            [
                'key' => 'pending',
                'label' => 'Pending',
                'value' => $status['pending'],
                'description' => 'Waiting or active workflow items.',
            ],
        ];
    }

    protected function moduleCounts(User $user, $serviceApplications, $users): array
    {
        return [
            'users' => (clone $users)->count(),
            'active_users' => Schema::hasColumn('users', 'is_active') ? (clone $users)->where('is_active', true)->count() : 0,
            'inactive_users' => Schema::hasColumn('users', 'is_active') ? (clone $users)->where('is_active', false)->count() : 0,
            'services' => Service::count(),
            'active_services' => Schema::hasColumn('services', 'status') ? Service::where('status', 'active')->count() : Service::count(),
            'inactive_services' => Schema::hasColumn('services', 'status') ? Service::where('status', 'inactive')->count() : 0,
            'forms' => ServiceForm::count(),
            'form_sections' => class_exists(ServiceFormSection::class) ? ServiceFormSection::count() : 0,
            'form_fields' => class_exists(ServiceFormField::class) ? ServiceFormField::count() : 0,
            'windows' => class_exists(Window::class) ? Window::count() : 0,
            'applications' => (clone $serviceApplications)->count(),
            'appointments' => $this->appointmentCounts($user, clone $serviceApplications)['total'],
        ];
    }

    protected function recentApplications($query): array
    {
        return $query
            ->with(['service', 'customer', 'currentWindow'])
            ->latest('submitted_at')
            ->limit(8)
            ->get()
            ->map(fn (ServiceApplication $application) => [
                'id' => $application->id,
                'tracking_number' => $application->tracking_number,
                'service_name' => $application->service?->name,
                'customer_name' => $application->customer?->name,
                'window_name' => $application->currentWindow?->name,
                'status' => $application->status,
                'submitted_at' => $application->submitted_at,
                'updated_at' => $application->updated_at,
            ])
            ->values()
            ->all();
    }

    protected function recentUsers($query): array
    {
        return $query
            ->with('roles')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'is_active' => (bool) ($user->is_active ?? false),
                'created_at' => $user->created_at,
            ])
            ->values()
            ->all();
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
            'under_review' => (clone $query)->whereIn('status', ['front_officer_review', 'forwarded_to_back_officer', 'back_officer_review', 'under_review', 'under_back_review', 'manager_review'])->count(),
            'appointed' => (clone $query)->whereIn('status', ['appointment_scheduled'])->count(),
            'completed' => (clone $query)->whereIn('status', ['completed', 'closed'])->count(),
            'shared' => (clone $query)->whereIn('status', ['shared', 'shared_to_front_officer', 'shared_to_back_officer'])->count(),
            'returned' => (clone $query)->whereIn('status', ['returned', 'returned_to_customer', 'returned_to_front_officer', 'returned_to_back_officer'])->count(),
            'escalated' => (clone $query)->whereIn('status', ['escalated', 'escalated_to_manager', 'manager_review', 'manager_forwarded'])->count(),
        ];
    }

    protected function paymentCounts(User $user): array
    {
        if (! Schema::hasTable('payments')) {
            return ['pending' => 0, 'paid' => 0];
        }

        $query = DB::table('payments');

        if ($user->hasRole(AppRoles::CUSTOMER)) {
            if (Schema::hasColumn('payments', 'user_id')) {
                $query->where('user_id', $user->id);
            } elseif (Schema::hasColumn('payments', 'customer_id')) {
                $query->where('customer_id', $user->id);
            }
        }

        return [
            'pending' => (clone $query)->whereIn('status', ['pending', 'unpaid', 'waiting'])->count(),
            'paid' => (clone $query)->whereIn('status', ['paid', 'completed', 'success'])->count(),
        ];
    }

    protected function appointmentCounts(User $user, $serviceApplications = null): array
    {
        if (! Schema::hasTable('service_application_appointments')) {
            return ['total' => 0, 'upcoming' => 0];
        }

        $applicationIds = $serviceApplications
            ? (clone $serviceApplications)->pluck('id')
            : ServiceApplication::query()->where('customer_id', $user->id)->pluck('id');

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

            if ($user->hasRole(AppRoles::CUSTOMER)) {
                if (Schema::hasColumn($table, 'user_id')) {
                    $query->where('user_id', $user->id);
                } elseif (Schema::hasColumn($table, 'customer_id')) {
                    $query->where('customer_id', $user->id);
                }
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
            ['label' => 'Roles', 'href' => '/dashboard/roles', 'permission' => 'roles.read'],
            ['label' => 'Permissions', 'href' => '/dashboard/permissions', 'permission' => 'permissions.read'],
            ['label' => 'Services', 'href' => '/dashboard/services', 'permission' => 'services.read'],
            ['label' => 'Form Builder', 'href' => '/dashboard/service-forms', 'permission' => 'service_forms.read'],
            ['label' => 'Service Windows', 'href' => '/dashboard/service-window', 'permission' => 'service_windows.read'],
            ['label' => 'Windows', 'href' => '/dashboard/windows', 'permission' => 'windows.read'],
            ['label' => 'Applications', 'href' => '/dashboard/service-applications', 'permission' => 'service_applications.read'],
            ['label' => 'Officer Queue', 'href' => '/dashboard/officer/applications', 'permission' => 'service_applications.review'],
            ['label' => 'New Application', 'href' => '/services', 'permission' => 'applications.own'],
            ['label' => 'Total Application', 'href' => '/dashboard/my-applications', 'permission' => 'applications.own'],
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
