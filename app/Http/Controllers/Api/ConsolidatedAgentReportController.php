<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AppRoles;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsolidatedAgentReportController extends Controller
{
    private function scope(Request $request): array
    {
        $user = $request->user();
        abort_unless($user && $user->is_active, 403);
        if ($user->hasRole(AppRoles::SUPER_ADMIN)) {
            return ['level' => 'all', 'city_id' => null, 'subcity_id' => null, 'woreda_id' => null];
        }
        abort_unless($user->hasRole(AppRoles::ADMIN), 403);
        $level = AppRoles::userLevel($user);
        abort_unless(in_array($level, AppRoles::levels(), true), 403);
        abort_unless($user->city_id, 403);
        if (in_array($level, [AppRoles::LEVEL_SUBCITY, AppRoles::LEVEL_WOREDA], true)) {
            abort_unless($user->subcity_id, 403);
        }
        if ($level === AppRoles::LEVEL_WOREDA) {
            abort_unless($user->woreda_id, 403);
        }
        return [
            'level' => $level,
            'city_id' => (int) $user->city_id,
            'subcity_id' => $level !== AppRoles::LEVEL_CITY ? (int) $user->subcity_id : null,
            'woreda_id' => $level === AppRoles::LEVEL_WOREDA ? (int) $user->woreda_id : null,
        ];
    }

    private function filters(Request $request): array
    {
        return $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'status' => ['nullable', 'in:draft,submitted,under_review,returned,approved,rejected,completed'],
            'administrative_level' => ['nullable', 'in:city,subcity,woreda'],
            'city_id' => ['nullable', 'integer', 'min:1'],
            'subcity_id' => ['nullable', 'integer', 'min:1'],
            'woreda_id' => ['nullable', 'integer', 'min:1'],
            'agent_id' => ['nullable', 'integer', 'min:1'],
            'window_id' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
    }

    private function records(array $scope, array $filters): Builder
    {
        $q = DB::table('agent_ticket_applications as ata')
            ->join('service_applications as sa', 'sa.id', '=', 'ata.service_application_id')
            ->join('tickets as t', 't.id', '=', 'ata.ticket_id')
            ->join('users as agent', 'agent.id', '=', 'ata.agent_id');
        foreach (['city_id', 'subcity_id', 'woreda_id'] as $column) {
            if ($scope[$column] !== null) $q->where('sa.'.$column, $scope[$column]);
            if (!empty($filters[$column])) $q->where('sa.'.$column, $filters[$column]);
        }
        foreach (['administrative_level', 'status'] as $column) {
            if (!empty($filters[$column])) $q->where('sa.'.$column, $filters[$column]);
        }
        if (!empty($filters['agent_id'])) $q->where('ata.agent_id', $filters['agent_id']);
        if (!empty($filters['window_id'])) $q->where('ata.window_id', $filters['window_id']);
        if (!empty($filters['from'])) $q->where('ata.created_at', '>=', $filters['from'].' 00:00:00');
        if (!empty($filters['to'])) $q->where('ata.created_at', '<', \Carbon\Carbon::parse($filters['to'])->addDay()->format('Y-m-d').' 00:00:00');
        return $q;
    }

    public function index(Request $request): JsonResponse
    {
        $scope = $this->scope($request);
        $filters = $this->filters($request);
        $base = $this->records($scope, $filters);
        $summary = (clone $base)->selectRaw('COUNT(*) AS total')
            ->selectRaw("SUM(CASE WHEN sa.status = 'submitted' THEN 1 ELSE 0 END) AS submitted")
            ->selectRaw("SUM(CASE WHEN sa.status = 'completed' THEN 1 ELSE 0 END) AS completed")
            ->selectRaw("SUM(CASE WHEN sa.status = 'rejected' THEN 1 ELSE 0 END) AS rejected")
            ->selectRaw("SUM(CASE WHEN sa.status NOT IN ('submitted', 'completed', 'rejected') THEN 1 ELSE 0 END) AS other")
            ->selectRaw('COUNT(DISTINCT ata.agent_id) AS agents')->first();
        $byAgent = (clone $base)->select('ata.agent_id', 'agent.name as agent_name')
            ->selectRaw('COUNT(*) AS total')
            ->selectRaw("SUM(CASE WHEN sa.status = 'submitted' THEN 1 ELSE 0 END) AS submitted")
            ->selectRaw("SUM(CASE WHEN sa.status = 'completed' THEN 1 ELSE 0 END) AS completed")
            ->selectRaw("SUM(CASE WHEN sa.status = 'rejected' THEN 1 ELSE 0 END) AS rejected")
            ->groupBy('ata.agent_id', 'agent.name')->orderByDesc('total')->get();
        $byWindow = (clone $base)->select('ata.window_id')->selectRaw('COUNT(*) AS total')
            ->groupBy('ata.window_id')->orderByDesc('total')->get();
        $page = (clone $base)->select([
            'ata.id', 'ata.agent_id', 'agent.name as agent_name', 'ata.created_at as processed_at',
            't.ticket_number', 't.service_name', 'ata.window_id', 't.status as ticket_status',
            'sa.tracking_number', 'sa.status as application_status', 'sa.administrative_level',
            'sa.city_id', 'sa.subcity_id', 'sa.woreda_id',
        ])->orderByDesc('ata.created_at')->orderByDesc('ata.id')
            ->paginate((int) ($filters['per_page'] ?? 20));
        return response()->json([
            'success' => true, 'message' => 'Consolidated agent report retrieved.',
            'data' => [
                'scope' => $scope,
                'summary' => collect((array) $summary)->map(fn ($v) => (int) $v)->all(),
                'by_agent' => $byAgent,
                'by_window' => $byWindow,
                'records' => $page->items(),
            ],
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total()],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $scope = $this->scope($request);
        $filters = $this->filters($request);
        $query = $this->records($scope, $filters)->select([
            'ata.created_at as processed_at', 'agent.name as agent_name', 't.ticket_number',
            'ata.window_id', 't.service_name', 'sa.tracking_number', 'sa.status as application_status',
            'sa.administrative_level', 'sa.city_id', 'sa.subcity_id', 'sa.woreda_id',
        ])->orderByDesc('ata.created_at')->orderByDesc('ata.id');
        return response()->streamDownload(function () use ($query) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, ['Processed At', 'Agent', 'Ticket', 'Window', 'Service', 'Tracking Number',
                'Application Status', 'Administrative Level', 'City ID', 'Subcity ID', 'Woreda ID']);
            foreach ($query->cursor() as $row) {
                fputcsv($stream, array_map(static function ($value) {
                    $text = (string) ($value ?? '');
                    return preg_match('/^[\x00-\x20]*[=+@\-]/', $text) ? "'".$text : $text;
                }, array_values((array) $row)));
            }
            fclose($stream);
        }, 'mesob-consolidated-agent-report-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store, private',
        ]);
    }
}
