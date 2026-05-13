<?php

namespace App\Services;

use App\Models\ServiceApplication;
use App\Models\ServiceApplicationHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OfficerApplicationService
{
    public function queue(User $officer)
    {
        return ServiceApplication::with([
            'service',
            'customer',
            'currentWindow',
        ])
            ->whereHas('service.assignedUsers', function ($query) use ($officer) {
                $query->where('users.id', $officer->id);
            })
            ->whereIn('status', [
                'submitted',
                'under_review',
                'returned',
            ])
            ->latest()
            ->paginate(10);
    }

    public function show(ServiceApplication $application)
    {
        return $application->load([
            'service',
            'customer',
            'currentWindow',
            'currentOfficer',
            'data',
            'files',
            'workflows.window',
            'workflows.officer',
            'histories.actor',
        ]);
    }

    public function approve(ServiceApplication $application, User $officer, ?string $remark = null)
    {
        return DB::transaction(function () use ($application, $officer, $remark) {
            $oldStatus = $application->status;

            $currentWorkflow = $application->workflows()
                ->where('window_id', $application->current_window_id)
                ->first();

            if ($currentWorkflow) {
                $currentWorkflow->update([
                    'status' => 'approved',
                    'officer_id' => $officer->id,
                    'acted_by' => $officer->id,
                    'action' => 'approved',
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);
            }

            $nextWorkflow = $application->workflows()
                ->where('status', 'pending')
                ->with('window')
                ->oldest('id')
                ->first();

            if ($nextWorkflow) {
                $nextWorkflow->update(['status' => 'processing']);

                $application->update([
                    'status' => 'under_review',
                    'current_stage' => $nextWorkflow->window?->name ?? 'under_review',
                    'current_window_id' => $nextWorkflow->window_id,
                    'current_officer_id' => null,
                    'assigned_to' => null,
                ]);

                $newStatus = 'under_review';
                $action = 'approved_forwarded';
            } else {
                $application->update([
                    'status' => 'approved',
                    'current_stage' => 'approved',
                    'approved_at' => now(),
                    'current_officer_id' => $officer->id,
                    'assigned_to' => $officer->id,
                ]);

                $newStatus = 'approved';
                $action = 'approved';
            }

            $this->history($application, $oldStatus, $newStatus, $action, $remark, $officer->id);

            return $this->show($application->fresh());
        });
    }

    public function reject(ServiceApplication $application, User $officer, ?string $remark = null)
    {
        return DB::transaction(function () use ($application, $officer, $remark) {
            $oldStatus = $application->status;

            $application->update([
                'status' => 'rejected',
                'current_stage' => 'rejected',
                'rejected_at' => now(),
                'rejection_reason' => $remark,
                'current_officer_id' => $officer->id,
                'assigned_to' => $officer->id,
            ]);

            $application->workflows()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'rejected',
                    'officer_id' => $officer->id,
                    'acted_by' => $officer->id,
                    'action' => 'rejected',
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            $this->history($application, $oldStatus, 'rejected', 'rejected', $remark, $officer->id);

            return $this->show($application->fresh());
        });
    }

    public function returnApplication(ServiceApplication $application, User $officer, ?string $remark = null)
    {
        return DB::transaction(function () use ($application, $officer, $remark) {
            $oldStatus = $application->status;

            $application->update([
                'status' => 'returned',
                'current_stage' => 'returned',
                'current_officer_id' => $officer->id,
                'assigned_to' => $application->customer_id,
                'returned_count' => ((int) $application->returned_count) + 1,
            ]);

            $application->workflows()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'returned',
                    'officer_id' => $officer->id,
                    'acted_by' => $officer->id,
                    'action' => 'returned',
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            $this->history($application, $oldStatus, 'returned', 'returned', $remark, $officer->id);

            return $this->show($application->fresh());
        });
    }

    public function complete(ServiceApplication $application, User $officer, ?string $remark = null)
    {
        return DB::transaction(function () use ($application, $officer, $remark) {
            $oldStatus = $application->status;

            $application->update([
                'status' => 'completed',
                'current_stage' => 'completed',
                'completed_at' => now(),
                'current_officer_id' => $officer->id,
                'assigned_to' => $officer->id,
            ]);

            $application->workflows()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'completed',
                    'officer_id' => $officer->id,
                    'acted_by' => $officer->id,
                    'action' => 'completed',
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            $this->history($application, $oldStatus, 'completed', 'completed', $remark, $officer->id);

            return $this->show($application->fresh());
        });
    }

    protected function history(
        ServiceApplication $application,
        ?string $from,
        string $to,
        string $action,
        ?string $remark,
        int $actorId
    ): void {
        ServiceApplicationHistory::create([
            'application_id' => $application->id,
            'from_status' => $from,
            'to_status' => $to,
            'action' => $action,
            'action_type' => 'officer_action',
            'remark' => $remark,
            'actor_id' => $actorId,
        ]);
    }
}
