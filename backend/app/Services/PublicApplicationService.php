<?php

namespace App\Services;

use App\Models\User;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\ServiceApplicationData;
use App\Models\ServiceApplicationWorkflow;
use App\Models\ServiceApplicationHistory;
use Illuminate\Support\Facades\DB;

class PublicApplicationService
{
    public function __construct(
        protected ApplicationFileService $fileService
    ) {}

    public function getForm(Service $service)
    {
        return $service
            ->form()
            ->with('fields')
            ->where('is_active', true)
            ->first();
    }

    public function apply(
        Service $service,
        ?User $user,
        array $payload
    ) {
        return DB::transaction(function () use ($service, $user, $payload) {

            $firstWindow = $service->windows()
                ->orderBy('service_window.step_order')
                ->first();

            $application = ServiceApplication::create([
                'tracking_number' => $this->generateTrackingNumber(),
                'service_id' => $service->id,
                'customer_id' => $user?->id,
                'current_window_id' => $firstWindow?->id,
                'current_officer_id' => null,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            foreach ($payload['data'] as $field => $value) {
                ServiceApplicationData::create([
                    'application_id' => $application->id,
                    'field_name' => $field,
                    'field_value' => is_array($value)
                        ? json_encode($value)
                        : $value,
                ]);
            }

            if (!empty($payload['files'])) {
                $this->fileService->storeFiles(
                    $application,
                    $payload['files'],
                    $user
                );
            }

            foreach ($service->windows()->orderBy('service_window.step_order')->get() as $window) {
                ServiceApplicationWorkflow::create([
                    'application_id' => $application->id,
                    'window_id' => $window->id,
                    'status' => $window->id === $firstWindow?->id
                        ? 'processing'
                        : 'pending',
                ]);
            }

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => null,
                'to_status' => 'submitted',
                'action' => 'submitted',
                'remark' => 'Application submitted',
                'actor_id' => $user?->id,
            ]);

            return $application->load([
                'service',
                'data',
                'files',
                'workflow.window',
                'histories.actor',
            ]);
        });
    }

    protected function generateTrackingNumber(): string
    {
        $nextId = (ServiceApplication::max('id') ?? 0) + 1;

        return sprintf(
            'ADA-%s-%06d',
            now()->format('Y'),
            $nextId
        );
    }
}