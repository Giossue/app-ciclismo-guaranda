<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\RouteDownload;
use App\Models\RouteRating;
use App\Models\RouteView;
use App\Models\Track;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StatisticsController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        [$from, $to] = $this->dateRange($request);

        return Inertia::render('admin/statistics/index', [
            'filters' => [
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
            'metrics' => $this->metrics($from, $to),
            'topViewedRoutes' => $this->topViewedRoutes($from, $to),
            'topDownloadedRoutes' => $this->topDownloadedRoutes($from, $to),
            'topRatedRoutes' => $this->topRatedRoutes($from, $to),
            'incidentsByStatus' => $this->incidentsByStatus($from, $to),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', User::class);

        [$from, $to] = $this->dateRange($request);
        $metrics = $this->metrics($from, $to);
        $topViewedRoutes = $this->topViewedRoutes($from, $to);
        $topDownloadedRoutes = $this->topDownloadedRoutes($from, $to);
        $topRatedRoutes = $this->topRatedRoutes($from, $to);
        $incidentsByStatus = $this->incidentsByStatus($from, $to);

        return response()->streamDownload(function () use ($metrics, $topViewedRoutes, $topDownloadedRoutes, $topRatedRoutes, $incidentsByStatus): void {
            $output = fopen('php://output', 'w');

            fputcsv($output, ['Sección', 'Indicador', 'Valor', 'Detalle']);

            foreach ($metrics as $metric) {
                fputcsv($output, ['Métricas', $metric['label'], $metric['value'], $metric['description']]);
            }

            foreach ($topViewedRoutes as $route) {
                fputcsv($output, ['Rutas consultadas', $route['name'], $route['views_count'], $route['status'] ?? '']);
            }

            foreach ($topDownloadedRoutes as $route) {
                fputcsv($output, ['Rutas descargadas', $route['name'], $route['downloads_count'], $route['status'] ?? '']);
            }

            foreach ($topRatedRoutes as $route) {
                fputcsv($output, ['Rutas calificadas', $route['name'], $route['average_rating'], $route['ratings_count'].' valoración(es)']);
            }

            foreach ($incidentsByStatus as $status) {
                fputcsv($output, ['Incidencias por estado', $status['name'], $status['count'], '']);
            }

            fclose($output);
        }, 'guaranda-go-estadisticas.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{CarbonImmutable|null, CarbonImmutable|null}
     */
    private function dateRange(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        return [
            isset($validated['from']) ? CarbonImmutable::parse($validated['from'])->startOfDay() : null,
            isset($validated['to']) ? CarbonImmutable::parse($validated['to'])->endOfDay() : null,
        ];
    }

    /**
     * @return list<array{key: string, label: string, value: int|string, description: string}>
     */
    private function metrics(?CarbonImmutable $from, ?CarbonImmutable $to): array
    {
        $completedStatusId = DB::table('estados_recorrido')->where('name', 'finalizado')->value('id');

        return [
            [
                'key' => 'active_users',
                'label' => 'Usuarios activos',
                'value' => User::query()->where('active', true)->count(),
                'description' => 'Cuentas habilitadas para operar en la app',
            ],
            [
                'key' => 'routes',
                'label' => 'Rutas registradas',
                'value' => CyclingRoute::query()->withTrashed()->count(),
                'description' => 'Total de rutas oficiales creadas',
            ],
            [
                'key' => 'route_views',
                'label' => 'Consultas de rutas',
                'value' => $this->applyDateRange(RouteView::query(), 'viewed_at', $from, $to)->count(),
                'description' => 'Aperturas de detalle de ruta en el rango',
            ],
            [
                'key' => 'downloads',
                'label' => 'Descargas offline',
                'value' => $this->applyDateRange(RouteDownload::query(), 'downloaded_at', $from, $to)->count(),
                'description' => 'Paquetes offline descargados por ciclistas',
            ],
            [
                'key' => 'completed_tracks',
                'label' => 'Recorridos completados',
                'value' => $this->applyDateRange(Track::query(), 'ended_at', $from, $to)
                    ->when($completedStatusId, fn (Builder $query) => $query->where('track_status_id', $completedStatusId))
                    ->count(),
                'description' => 'Recorridos finalizados por usuarios',
            ],
            [
                'key' => 'incidents',
                'label' => 'Incidencias reportadas',
                'value' => $this->applyDateRange(Incident::query(), 'reported_at', $from, $to)->count(),
                'description' => 'Reportes enviados por ciclistas',
            ],
        ];
    }

    private function topViewedRoutes(?CarbonImmutable $from, ?CarbonImmutable $to): array
    {
        return $this->applyDateRange(RouteView::query(), 'viewed_at', $from, $to)
            ->join('rutas', 'rutas.id', '=', 'consultas_ruta.route_id')
            ->leftJoin('estados_ruta', 'estados_ruta.id', '=', 'rutas.route_status_id')
            ->groupBy('rutas.id', 'rutas.name', 'estados_ruta.name')
            ->orderByDesc(DB::raw('count(*)'))
            ->limit(10)
            ->get([
                'rutas.id',
                'rutas.name',
                'estados_ruta.name as status',
                DB::raw('count(*) as views_count'),
            ])
            ->map(fn ($route): array => [
                'id' => $route->id,
                'name' => $route->name,
                'status' => $route->status,
                'views_count' => (int) $route->views_count,
            ])
            ->all();
    }

    private function topDownloadedRoutes(?CarbonImmutable $from, ?CarbonImmutable $to): array
    {
        return $this->applyDateRange(RouteDownload::query(), 'downloaded_at', $from, $to)
            ->join('rutas', 'rutas.id', '=', 'descargas_ruta.route_id')
            ->leftJoin('estados_ruta', 'estados_ruta.id', '=', 'rutas.route_status_id')
            ->groupBy('rutas.id', 'rutas.name', 'estados_ruta.name')
            ->orderByDesc(DB::raw('count(*)'))
            ->limit(10)
            ->get([
                'rutas.id',
                'rutas.name',
                'estados_ruta.name as status',
                DB::raw('count(*) as downloads_count'),
            ])
            ->map(fn ($route): array => [
                'id' => $route->id,
                'name' => $route->name,
                'status' => $route->status,
                'downloads_count' => (int) $route->downloads_count,
            ])
            ->all();
    }

    private function topRatedRoutes(?CarbonImmutable $from, ?CarbonImmutable $to): array
    {
        return $this->applyDateRange(RouteRating::query(), 'rated_at', $from, $to)
            ->join('rutas', 'rutas.id', '=', 'valoraciones_ruta.route_id')
            ->leftJoin('estados_moderacion', 'estados_moderacion.id', '=', 'valoraciones_ruta.moderation_status_id')
            ->where('estados_moderacion.name', 'aprobado')
            ->groupBy('rutas.id', 'rutas.name')
            ->orderByDesc(DB::raw('avg(valoraciones_ruta.rating)'))
            ->limit(10)
            ->get([
                'rutas.id',
                'rutas.name',
                DB::raw('round(avg(valoraciones_ruta.rating), 2) as average_rating'),
                DB::raw('count(*) as ratings_count'),
            ])
            ->map(fn ($route): array => [
                'id' => $route->id,
                'name' => $route->name,
                'average_rating' => (string) $route->average_rating,
                'ratings_count' => (int) $route->ratings_count,
            ])
            ->all();
    }

    private function incidentsByStatus(?CarbonImmutable $from, ?CarbonImmutable $to): array
    {
        return $this->applyDateRange(Incident::query(), 'reported_at', $from, $to)
            ->join('estados_incidencia', 'estados_incidencia.id', '=', 'incidencias.incident_status_id')
            ->groupBy('estados_incidencia.id', 'estados_incidencia.name')
            ->orderBy('estados_incidencia.name')
            ->get([
                'estados_incidencia.id',
                'estados_incidencia.name',
                DB::raw('count(*) as count'),
            ])
            ->map(fn ($status): array => [
                'id' => $status->id,
                'name' => $status->name,
                'count' => (int) $status->count,
            ])
            ->all();
    }

    /**
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    private function applyDateRange(Builder $query, string $column, ?CarbonImmutable $from, ?CarbonImmutable $to): Builder
    {
        return $query
            ->when($from, fn (Builder $query) => $query->where($column, '>=', $from))
            ->when($to, fn (Builder $query) => $query->where($column, '<=', $to));
    }
}
