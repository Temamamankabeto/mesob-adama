<?php

namespace App\Services;

use App\Models\User;
use App\Models\Service;
use App\Models\ServiceApplication;
use App\Models\ServiceApplicationData;
use App\Models\ServiceApplicationWorkflow;
use App\Models\ServiceApplicationHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublicApplicationService
{
    public function __construct(
        protected ApplicationFileService $fileService
    ) {}

    public function getForm(Service $service)
    {
        return $service
            ->forms()
            ->with([
                'steps.sections.fields.conditions.dependsOnField',
                'steps.fields.conditions.dependsOnField',
                'sections.fields.conditions.dependsOnField',
                'fields.conditions.dependsOnField',
            ])
            ->where('is_active', true)
            ->latest()
            ->first();
    }

    public function apply(Service $service, ?User $user, array $payload)
    {
        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['Authenticated user is required to submit an application.'],
            ]);
        }

        $form = $this->getForm($service);

        if (!$form) {
            throw ValidationException::withMessages([
                'service_id' => ['No active form found for this service.'],
            ]);
        }

        $this->validateRequiredFields($form->fields->where('is_active', true), $payload['data'] ?? [], $payload['files'] ?? []);

        return DB::transaction(function () use ($service, $user, $payload) {
            $firstWindow = $service->windows()
                ->orderBy('service_window.step_order')
                ->first();

            $application = ServiceApplication::create([
                'tracking_number' => $this->generateTrackingNumber(),
                'service_id' => $service->id,
                'customer_id' => $user->id,
                'current_window_id' => $firstWindow?->id,
                'current_officer_id' => null,
                'status' => 'submitted',
                'current_stage' => 'submitted',
                'priority' => 'normal',
                'submitted_at' => now(),
            ]);

            foreach (($payload['data'] ?? []) as $field => $value) {
                ServiceApplicationData::create([
                    'application_id' => $application->id,
                    'field_name' => (string) $field,
                    'field_value' => is_array($value) ? json_encode($value) : $value,
                ]);
            }

            if (!empty($payload['files'])) {
                $this->fileService->storeFiles($application, $payload['files'], $user);
            }

            $windows = $service->windows()->orderBy('service_window.step_order')->get();

            foreach ($windows as $window) {
                ServiceApplicationWorkflow::create([
                    'application_id' => $application->id,
                    'window_id' => $window->id,
                    'from_stage' => null,
                    'to_stage' => $window->name ?? null,
                    'status' => $window->id === $firstWindow?->id ? 'processing' : 'pending',
                ]);
            }

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => null,
                'to_status' => 'submitted',
                'action' => 'submitted',
                'action_type' => 'submitted',
                'remark' => 'Application submitted',
                'actor_id' => $user->id,
            ]);

            return $application->load([
                'service',
                'customer',
                'data',
                'files',
                'workflows.window',
                'histories.actor',
            ]);
        });
    }

    protected function validateRequiredFields($fields, array $data, array $files): void
    {
        $errors = [];

        foreach ($fields as $field) {
            if (!$field->is_required) {
                continue;
            }

            $name = $field->name;
            $hasValue = array_key_exists($name, $data) && $data[$name] !== null && $data[$name] !== '';
            $hasFile = array_key_exists($name, $files) && !empty($files[$name]);

            if (!$hasValue && !$hasFile) {
                $errors["data.$name"] = ["The {$field->label} field is required."];
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    protected function generateTrackingNumber(): string
    {
        do {
            $trackingNumber = sprintf(
                'ADA-%s-%06d',
                now()->format('Y'),
                random_int(1, 999999)
            );
        } while (ServiceApplication::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }
}
