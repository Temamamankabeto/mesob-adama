<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'service' => [
                'id' => $this->service?->id,
                'name' => $this->service?->name,
            ],

            'window' => $this->window ? [
                'id' => $this->window->id,
                'name' => $this->window->name,
                'city' => $this->window->city ? [
                    'id' => $this->window->city->id,
                    'name' => $this->window->city_title ?? $this->window->city->name,
                ] : null,
                'subcity' => $this->window->subcity ? [
                    'id' => $this->window->subcity->id,
                    'name' => $this->window->subcity_title ?? $this->window->subcity->name,
                ] : null,
                'woreda' => $this->window->woreda ? [
                    'id' => $this->window->woreda->id,
                    'name' => $this->window->woreda_title ?? $this->window->woreda->name,
                ] : null,
            ] : null,

            'satisfaction' => $this->satisfaction,

            'overall_rating' => $this->overall_rating,

            'staff_behavior' => $this->staff_behavior,

            'waiting_time' => $this->waiting_time,

            'service_quality' => $this->service_quality,

            'cleanliness' => $this->cleanliness,

            'comment' => $this->comment,

            'gender' => $this->gender,

            'age' => $this->age,

            'submitted_at' => $this->created_at,

        ];
    }
}
