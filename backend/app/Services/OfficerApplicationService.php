<?php

namespace App\Services;

use App\Models\ServiceApplication;
use App\Models\ServiceApplicationHistory;
use App\Models\ServiceApplicationWorkflow;
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
            'workflow.window',
            'workflow.officer',
            'histories.actor',
        ]);
    }

    public function approve(
        ServiceApplication $application,
        User $officer,
        ?string $remark = null
    ) {
        return DB::transaction(function () use ($application, $officer, $remark) {

            $oldStatus = $application->status;

            $currentWorkflow = $application->workflow()
                ->where('window_id', $application->current_window_id)
                ->first();

            if ($currentWorkflow) {
                $currentWorkflow->update([
                    'status' => 'approved',
                    'officer_id' => $officer->id,
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);
            }

            $nextWorkflow = $application->workflow()
                ->where('status', 'pending')
                ->with('window')
                ->oldest()
                ->first();

            if ($nextWorkflow) {
                $nextWorkflow->update([
                    'status' => 'processing',
                ]);

                $application->update([
                    'status' => 'under_review',
                    'current_window_id' => $nextWorkflow->window_id,
                    'current_officer_id' => null,
                ]);

                $newStatus = 'under_review';
                $action = 'approved_forwarded';
            } else {
                $application->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                    'current_officer_id' => $officer->id,
                ]);

                $newStatus = 'approved';
                $action = 'approved';
            }

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => $oldStatus,
                'to_status' => $newStatus,
                'action' => $action,
                'remark' => $remark,
                'actor_id' => $officer->id,
            ]);

            return $this->show($application->fresh());
        });
    }

    public function reject(
        ServiceApplication $application,
        User $officer,
        ?string $remark = null
    ) {
        return DB::transaction(function () use ($application, $officer, $remark) {

            $oldStatus = $application->status;

            $application->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'current_officer_id' => $officer->id,
            ]);

            $application->workflow()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'rejected',
                    'officer_id' => $officer->id,
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => $oldStatus,
                'to_status' => 'rejected',
                'action' => 'rejected',
                'remark' => $remark,
                'actor_id' => $officer->id,
            ]);

            return $this->show($application->fresh());
        });
    }

    public function returnApplication(
        ServiceApplication $application,
        User $officer,
        ?string $remark = null
    ) {
        return DB::transaction(function () use ($application, $officer, $remark) {

            $oldStatus = $application->status;

            $application->update([
                'status' => 'returned',
                'current_officer_id' => $officer->id,
            ]);

            $application->workflow()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'returned',
                    'officer_id' => $officer->id,
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => $oldStatus,
                'to_status' => 'returned',
                'action' => 'returned',
                'remark' => $remark,
                'actor_id' => $officer->id,
            ]);

            return $this->show($application->fresh());
        });
    }

    public function complete(
        ServiceApplication $application,
        User $officer,
        ?string $remark = null
    ) {
        return DB::transaction(function () use ($application, $officer, $remark) {

            $oldStatus = $application->status;

            $application->update([
                'status' => 'completed',
                'current_officer_id' => $officer->id,
            ]);

            $application->workflow()
                ->where('window_id', $application->current_window_id)
                ->update([
                    'status' => 'completed',
                    'officer_id' => $officer->id,
                    'remark' => $remark,
                    'acted_at' => now(),
                ]);

            ServiceApplicationHistory::create([
                'application_id' => $application->id,
                'from_status' => $oldStatus,
                'to_status' => 'completed',
                'action' => 'completed',
                'remark' => $remark,
                'actor_id' => $officer->id,
            ]);

            return $this->show($application->fresh());
        });
    }
}