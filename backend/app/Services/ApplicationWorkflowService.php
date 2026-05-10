<?php

namespace App\Services;

use App\Models\ServiceApplication;
use App\Models\ServiceApplicationHistory;
use Illuminate\Support\Facades\Auth;

class ApplicationWorkflowService
{
    public function approve(ServiceApplication $application)
    {
        $this->changeStatus(
            $application,
            'approved',
            'Application approved'
        );

        return $application->fresh();
    }

    public function reject(
        ServiceApplication $application,
        ?string $reason = null
    ) {
        $this->changeStatus(
            $application,
            'rejected',
            $reason ?? 'Application rejected'
        );

        return $application->fresh();
    }

    public function returnForCorrection(
        ServiceApplication $application,
        ?string $reason = null
    ) {
        $this->changeStatus(
            $application,
            'returned_for_correction',
            $reason ?? 'Returned for correction'
        );

        return $application->fresh();
    }

    public function complete(ServiceApplication $application)
    {
        $this->changeStatus(
            $application,
            'completed',
            'Application completed'
        );

        return $application->fresh();
    }

    protected function changeStatus(
        ServiceApplication $application,
        string $status,
        string $note
    ) {
        $oldStatus = $application->status;

        $application->update([
            'status' => $status,
        ]);

        ServiceApplicationHistory::create([
            'application_id' => $application->id,
            'action' => $status,
            'performed_by' => Auth::id(),
            'note' => $note,
            'old_status' => $oldStatus,
            'new_status' => $status,
        ]);
    }
}
