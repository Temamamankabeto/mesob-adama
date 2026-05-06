<?php

namespace App\Services;

use App\Models\Service;

class ServiceWindowService
{
    /**
     * Assign windows to service.
     */
    public function assign(
        Service $service,
        array $windows
    ): Service {

        $syncData = [];

        foreach ($windows as $window) {

            $syncData[
                $window['window_id']
            ] = [

                'step_order' =>
                    $window['step_order'],

                'is_required' =>
                    $window['is_required'],
            ];
        }

        $service->windows()
            ->sync($syncData);

        return $service->load('windows');
    }
}