<?php

namespace App\Http\Controllers\Api\Officer;

use App\Http\Controllers\Controller;
use App\Services\OfficerTicketCallingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OfficerTicketCallingController extends Controller
{
    public function __construct(private OfficerTicketCallingService $calling) {}

    private function respond(string $message, mixed $data): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data, 'meta' => []]);
    }

    public function queue(Request $request): JsonResponse
    {
        return $this->respond('Officer ticket queue retrieved.', $this->calling->queue($request->user()));
    }

    public function callNext(Request $request): JsonResponse
    {
        $input = $request->validate(['window_id' => ['required', 'integer', 'exists:windows,id']]);
        $result = $this->calling->callNext($request->user(), (int) $input['window_id']);
        return $this->respond($result ? 'Next ticket called.' : 'Current ticket completed; no next ticket available.', $result);
    }

    public function pause(Request $request): JsonResponse
    {
        $input = $request->validate(['window_id' => ['required', 'integer', 'exists:windows,id']]);
        return $this->respond('Queue paused; current serving ticket completed.', $this->calling->pause($request->user(), (int) $input['window_id']));
    }

    public function resume(Request $request): JsonResponse
    {
        $input = $request->validate(['window_id' => ['required', 'integer', 'exists:windows,id']]);
        return $this->respond('Queue resumed.', $this->calling->resume($request->user(), (int) $input['window_id']));
    }

    public function call(Request $request, int $ticket): JsonResponse
    {
        return $this->respond('Ticket called.', $this->calling->action($request->user(), $ticket, 'call'));
    }

    public function recall(Request $request, int $ticket): JsonResponse
    {
        return $this->respond('Ticket recalled.', $this->calling->action($request->user(), $ticket, 'recall'));
    }

    public function start(Request $request, int $ticket): JsonResponse
    {
        return $this->respond('Service started.', $this->calling->action($request->user(), $ticket, 'start'));
    }

    public function skip(Request $request, int $ticket): JsonResponse
    {
        $input = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        return $this->respond('Ticket marked as no-show.', $this->calling->action($request->user(), $ticket, 'skip', $input['reason']));
    }
}
