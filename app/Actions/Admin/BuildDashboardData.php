<?php

namespace App\Actions\Admin;

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\ModerationStatus;
use App\Models\PointOfInterest;
use App\Models\RouteDownload;
use App\Models\RouteRating;
use App\Models\RouteStatus;
use App\Models\RouteView;
use App\Models\Track;
use App\Models\TrackStatus;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class BuildDashboardData
{
    /**
     * @return array<string, mixed>
     */
    private CarbonImmutable $now;

    private CarbonImmutable $periodStart;

    private CarbonImmutable $periodEnd;

    private CarbonImmutable $weekStart;

    public function __construct()
    {
        $this->now = CarbonImmutable::now();
        $this->periodStart = $this->now->subDays(29)->startOfDay();
        $this->periodEnd = $this->now->endOfDay();
        $this->weekStart = $this->now->subDays(6)->startOfDay();
    }

    /**
     * Indicadores de cabecera: consultas baratas que van en la primera respuesta.
     *
     * @return list<array<string, mixed>>
     */
    public function overview(): array
    {
        $periodStart = $this->periodStart;
        $periodEnd = $this->periodEnd;
        $routeViews = RouteView::query()->whereBetween('viewed_at', [$periodStart, $periodEnd])->count();
        $downloads = RouteDownload::query()->whereBetween('downloaded_at', [$periodStart, $periodEnd])->count();

        return [
            [
                'key' => 'users',
                'label' => 'Usuarios registrados',
                'value' => User::query()->withTrashed()->count(),
                'description' => 'Total histórico, incluidas las cuentas dadas de baja',
            ],
            [
                'key' => 'activeUsers',
                'label' => 'Usuarios activos',
                'value' => User::query()->where('active', true)->count(),
                'description' => 'Cuentas habilitadas para usar la aplicación',
            ],
            [
                'key' => 'pois',
                'label' => 'POIs activos',
                'value' => PointOfInterest::query()->where('active', true)->count(),
                'description' => 'Puntos de interés disponibles en las rutas',
            ],
            [
                'key' => 'routeViews',
                'label' => 'Consultas de rutas',
                'value' => $routeViews,
                'description' => 'Detalles de ruta abiertos en los últimos 30 días',
            ],
            [
                'key' => 'downloads',
                'label' => 'Descargas offline',
                'value' => $downloads,
                'description' => 'Paquetes de ruta guardados en los últimos 30 días',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function activity(): array
    {
        $periodEnd = $this->periodEnd;
        $weekStart = $this->weekStart;
        $completedTrackStatusId = TrackStatus::query()->where('name', 'Finalizado')->value('id');
        $dailyActivity = $this->dailyActivity($this->now);

        return [
            'period' => 'Últimos 7 días',
            'newUsers' => User::query()->whereBetween('created_at', [$weekStart, $periodEnd])->count(),
            'completedTracks' => Track::query()
                ->when($completedTrackStatusId, fn ($query) => $query->where('track_status_id', $completedTrackStatusId))
                ->whereBetween('ended_at', [$weekStart, $periodEnd])
                ->count(),
            'days' => $dailyActivity,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function routeStatuses(): array
    {
        return RouteStatus::query()
            ->withCount('routes')
            ->orderBy('id')
            ->get()
            ->map(fn (RouteStatus $status): array => [
                'id' => $status->id,
                'name' => $status->name,
                'count' => $status->routes_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function popularRoutes(): array
    {
        $periodStart = $this->periodStart;
        $periodEnd = $this->periodEnd;

        return CyclingRoute::query()
            ->with('status:id,name')
            ->withCount([
                'routeViews as views_count' => fn ($query) => $query->whereBetween('viewed_at', [$periodStart, $periodEnd]),
                'downloads as downloads_count' => fn ($query) => $query->whereBetween('downloaded_at', [$periodStart, $periodEnd]),
            ])
            ->orderByDesc('views_count')
            ->orderByDesc('downloads_count')
            ->latest('id')
            ->limit(5)
            ->get(['id', 'name', 'route_status_id'])
            ->map(fn (CyclingRoute $route): array => [
                'id' => $route->id,
                'name' => $route->name,
                'status' => $route->status?->name,
                'views' => $route->views_count,
                'downloads' => $route->downloads_count,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function attention(): array
    {
        $pendingRatingStatusId = ModerationStatus::query()->where('name', 'Pendiente')->value('id');

        return [
            [
                'key' => 'incidents',
                'label' => 'Incidencias pendientes',
                'value' => Incident::query()->whereNull('resolved_at')->count(),
                'description' => 'Reportes que todavía requieren revisión o cierre',
                'tone' => 'warning',
            ],
            [
                'key' => 'ratings',
                'label' => 'Valoraciones pendientes',
                'value' => $pendingRatingStatusId === null
                    ? 0
                    : RouteRating::query()->where('moderation_status_id', $pendingRatingStatusId)->count(),
                'description' => 'Comentarios en espera de moderación',
                'tone' => 'default',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentIncidents(): array
    {
        return Incident::query()
            ->select(['id', 'route_id', 'user_id', 'incident_type_id', 'incident_status_id', 'reported_at'])
            ->with(['route:id,name', 'status:id,name', 'type:id,name', 'user:id,name,last_name'])
            ->latest('reported_at')
            ->limit(5)
            ->get()
            ->map(fn (Incident $incident): array => [
                'id' => $incident->id,
                'type' => $incident->type?->name ?? 'Incidencia',
                'reportedAt' => $incident->reported_at?->toAtomString(),
                'status' => $incident->status?->name,
                'route' => $incident->route === null ? null : [
                    'id' => $incident->route->id,
                    'name' => $incident->route->name,
                ],
                'reporter' => $incident->user === null ? null : [
                    'id' => $incident->user->id,
                    'name' => trim("{$incident->user->name} {$incident->user->last_name}"),
                ],
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, views: int, downloads: int}>
     */
    private function dailyActivity(CarbonImmutable $now): array
    {
        $start = $now->subDays(6)->startOfDay();
        $end = $now->endOfDay();
        $viewsByDay = $this->dailyCounts(RouteView::query(), 'viewed_at', $start, $end);
        $downloadsByDay = $this->dailyCounts(RouteDownload::query(), 'downloaded_at', $start, $end);

        return collect(range(0, 6))
            ->map(function (int $offset) use ($start, $viewsByDay, $downloadsByDay): array {
                $date = $start->addDays($offset);
                $key = $date->toDateString();

                return [
                    'label' => match ($date->dayOfWeekIso) {
                        1 => 'Lun',
                        2 => 'Mar',
                        3 => 'Mié',
                        4 => 'Jue',
                        5 => 'Vie',
                        6 => 'Sáb',
                        7 => 'Dom',
                    },
                    'views' => (int) $viewsByDay->get($key, 0),
                    'downloads' => (int) $downloadsByDay->get($key, 0),
                ];
            })
            ->all();
    }

    /**
     * @param  Builder<Model>  $query
     * @return Collection<string, int>
     */
    private function dailyCounts($query, string $column, CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return $query
            ->whereBetween($column, [$from, $to])
            ->selectRaw("DATE({$column}) as day, COUNT(*) as total")
            ->groupBy('day')
            ->pluck('total', 'day')
            ->map(fn ($total): int => (int) $total);
    }
}
