<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AppRoles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AgentReportController extends Controller
{
    private function authorizeAgent(Request $request): int
    {
        $user = $request->user();
        abort_unless($user && $user->is_active && $user->hasRole(AppRoles::AGENT)
            && $user->can('applications.create') && $user->can('service_forms.read'), 403);
        return (int) $user->id;
    }

    private function filters(Request $request): array
    {
        return $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'status' => ['nullable', 'in:draft,submitted,under_review,returned,approved,rejected,completed'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
    }

    private function records(int $agentId, array $filters)
    {
        $query = DB::table('agent_ticket_applications as ata')
            ->join('tickets as t', 't.id', '=', 'ata.ticket_id')
            ->join('service_applications as sa', 'sa.id', '=', 'ata.service_application_id')
            ->where('ata.agent_id', $agentId);

        if (!empty($filters['from'])) {
            $query->where('ata.created_at', '>=', $filters['from'].' 00:00:00');
        }
        if (!empty($filters['to'])) {
            $query->where('ata.created_at', '<', \Carbon\Carbon::parse($filters['to'])->addDay()->format('Y-m-d').' 00:00:00');
        }
        if (!empty($filters['status'])) {
            $query->where('sa.status', $filters['status']);
        }
        return $query;
    }

    public function index(Request $request): JsonResponse
    {
        $agentId = $this->authorizeAgent($request);
        $filters = $this->filters($request);
        $base = $this->records($agentId, $filters);

        $summary = (clone $base)->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN sa.status = 'submitted' THEN 1 ELSE 0 END) as submitted")
            ->selectRaw("SUM(CASE WHEN sa.status = 'completed' THEN 1 ELSE 0 END) as completed")
            ->selectRaw("SUM(CASE WHEN sa.status = 'rejected' THEN 1 ELSE 0 END) as rejected")
            ->selectRaw("SUM(CASE WHEN sa.status IN ('draft', 'under_review', 'returned', 'approved') THEN 1 ELSE 0 END) as other")
            ->first();

        $page = (clone $base)->select([
            'ata.id', 'ata.created_at as processed_at', 't.ticket_number',
            't.service_name', 't.window_id', 't.status as ticket_status',
            'sa.id as application_id', 'sa.tracking_number', 'sa.status as application_status',
            'sa.submitted_at',
        ])->orderByDesc('ata.created_at')->orderByDesc('ata.id')
            ->paginate((int) ($filters['per_page'] ?? 20));

        return response()->json([
            'success' => true,
            'message' => 'Individual agent report retrieved.',
            'data' => [
                'summary' => [
                    'total' => (int) $summary->total,
                    'submitted' => (int) $summary->submitted,
                    'completed' => (int) $summary->completed,
                    'rejected' => (int) $summary->rejected,
                    'other' => (int) $summary->other,
                ],
                'records' => $page->items(),
            ],
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $agentId = $this->authorizeAgent($request);
        $filters = $this->filters($request);
        $query = $this->records($agentId, $filters)
            ->select('ata.created_at as processed_at', 't.ticket_number', 't.service_name',
                't.window_id', 't.status as ticket_status', 'sa.tracking_number',
                'sa.status as application_status')
            ->orderByDesc('ata.created_at')->orderByDesc('ata.id');

        return response()->streamDownload(function () use ($query) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['Processed At', 'Ticket', 'Service', 'Window ID', 'Ticket Status', 'Tracking Number', 'Application Status']);
            foreach ($query->cursor() as $record) {
                $values = array_values((array) $record);
                // Prevent spreadsheet formula execution when CSV is opened in Excel.
                $safe = array_map(static function ($value) {
                    $text = (string) ($value ?? '');
                    return preg_match('/^[\x00-\x20]*[=+@\-]/', $text) ? "'".$text : $text;
                }, $values);
                fputcsv($stream, $safe);
            }
            fclose($stream);
        }, 'mesob-my-agent-report-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, private',
        ]);
    }
}
