<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreTrackPointRequest;
use App\Http\Requests\Cyclist\StoreTrackRequest;
use App\Models\CyclingRoute;
use App\Models\Track;
use App\Models\TrackGpsPoint;
use App\Models\TrackStatus;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TrackController extends Controller
{
    public function store(StoreTrackRequest $request, CyclingRoute $route): RedirectResponse
    {
        $inProgress = TrackStatus::query()->where('name', 'en curso')->firstOrFail();

        $track = Track::query()->create([
            'user_id' => $request->user()?->id,
            'route_id' => $route->id,
            'track_status_id' => $inProgress->id,
            'started_at' => now(),
            'distance_traveled_km' => 0,
            'total_time_seconds' => 0,
            'completion_percentage' => 0,
            'is_valid' => false,
            'summary' => $this->calculateSummaryData($route, collect()),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Track started.')]);

        return to_route('routes.show', $route->slug)->with('track_id', $track->id);
    }

    public function show(Track $track): InertiaResponse
    {
        $this->authorize('view', $track);

        $track->load(['route:id,name,slug', 'status:id,name', 'gpsPoints']);

        return Inertia::render('tracks/show', [
            'track' => $this->serializeTrack($track, true),
        ]);
    }

    public function point(StoreTrackPointRequest $request, Track $track): JsonResponse|RedirectResponse
    {
        $payload = $request->validated();

        /** @var TrackGpsPoint $point */
        $point = $track->gpsPoints()->create([
            'latitude' => $payload['latitude'],
            'longitude' => $payload['longitude'],
            'elevation_m' => $payload['elevation_m'] ?? null,
            'speed_kmh' => $payload['speed_kmh'] ?? null,
            'accuracy_m' => $payload['accuracy_m'] ?? null,
            'recorded_at' => isset($payload['recorded_at']) ? new \DateTimeImmutable((string) $payload['recorded_at']) : now(),
        ]);

        $this->syncPostgisPoint($point);
        $this->refreshMetrics($track);

        if ($request->expectsJson()) {
            return response()->json([
                'track' => $this->serializeTrack($track->fresh(['status', 'gpsPoints', 'route.metrics']), false),
            ]);
        }

        return back();
    }

    public function pause(Track $track): RedirectResponse
    {
        $this->authorize('update', $track);
        $this->ensureStatus($track, ['en curso']);

        $track->forceFill([
            'track_status_id' => $this->statusId('pausado'),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Track paused.')]);

        return back();
    }

    public function resume(Track $track): RedirectResponse
    {
        $this->authorize('update', $track);
        $this->ensureStatus($track, ['pausado']);

        $track->forceFill([
            'track_status_id' => $this->statusId('en curso'),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Track resumed.')]);

        return back();
    }

    public function finish(Track $track): RedirectResponse
    {
        $this->authorize('update', $track);
        $this->ensureStatus($track, ['en curso', 'pausado']);

        $track->forceFill([
            'track_status_id' => $this->statusId('finalizado'),
            'ended_at' => now(),
        ])->save();

        $this->refreshMetrics($track);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Track finished.')]);

        return to_route('tracks.show', $track);
    }

    public function cancel(Track $track): RedirectResponse
    {
        $this->authorize('update', $track);
        $this->ensureStatus($track, ['en curso', 'pausado']);

        $track->forceFill([
            'track_status_id' => $this->statusId('cancelado'),
            'ended_at' => now(),
            'is_valid' => false,
        ])->save();

        $this->refreshMetrics($track, forceInvalid: true);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Track cancelled.')]);

        return to_route('routes.show', $track->route->slug);
    }

    public function export(Track $track): Response|JsonResponse
    {
        $this->authorize('view', $track);

        $format = request()->query('format', 'geojson');
        $track->load(['route:id,name,slug', 'gpsPoints']);

        if ($format === 'gpx') {
            return response($this->toGpx($track), 200, [
                'Content-Type' => 'application/gpx+xml',
                'Content-Disposition' => "attachment; filename=recorrido-{$track->id}.gpx",
            ]);
        }

        return response()->json($this->toGeoJson($track), 200, [
            'Content-Disposition' => "attachment; filename=recorrido-{$track->id}.geojson",
        ]);
    }

    /**
     * @param  list<string>  $allowedStatuses
     */
    private function ensureStatus(Track $track, array $allowedStatuses): void
    {
        abort_unless(in_array($track->status?->name, $allowedStatuses, true), 422, 'Estado de recorrido no permitido para esta acción.');
    }

    private function statusId(string $name): int
    {
        return TrackStatus::query()->where('name', $name)->value('id')
            ?? abort(500, "Estado de recorrido no configurado: {$name}");
    }

    private function syncPostgisPoint(TrackGpsPoint $point): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('puntos_gps_recorrido', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE puntos_gps_recorrido SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?',
            [(float) $point->longitude, (float) $point->latitude, $point->id]
        );
    }

    private function refreshMetrics(Track $track, bool $forceInvalid = false): void
    {
        $track->load(['route.metrics', 'gpsPoints']);

        $summary = $this->calculateSummaryData($track->route, $track->gpsPoints);
        $isValid = ! $forceInvalid && ($summary['completion_percentage'] ?? 0) >= 90;

        $track->forceFill([
            'distance_traveled_km' => $summary['distance_traveled_km'],
            'total_time_seconds' => $this->elapsedSeconds($track),
            'completion_percentage' => $summary['completion_percentage'],
            'is_valid' => $isValid,
            'summary' => [
                ...$summary,
                'total_time_seconds' => $this->elapsedSeconds($track),
                'is_valid_for_rating' => $isValid,
            ],
        ])->save();
    }

    /**
     * @param  iterable<TrackGpsPoint>  $points
     * @return array<string, mixed>
     */
    private function calculateSummaryData(?CyclingRoute $route, iterable $points): array
    {
        $orderedPoints = collect($points)->sortBy('recorded_at')->values();
        $distance = 0.0;
        $elevationGain = 0.0;
        $lastPoint = null;

        foreach ($orderedPoints as $point) {
            if ($lastPoint instanceof TrackGpsPoint) {
                $distance += $this->haversineKm(
                    (float) $lastPoint->latitude,
                    (float) $lastPoint->longitude,
                    (float) $point->latitude,
                    (float) $point->longitude,
                );

                if ($lastPoint->elevation_m !== null && $point->elevation_m !== null) {
                    $delta = (float) $point->elevation_m - (float) $lastPoint->elevation_m;
                    $elevationGain += max(0, $delta);
                }
            }

            $lastPoint = $point;
        }

        $routeDistance = $this->routeDistanceKm($route);
        $completion = $routeDistance > 0 ? min(100, ($distance / $routeDistance) * 100) : 0;
        $remaining = max(0, $routeDistance - $distance);
        $firstRecordedAt = $orderedPoints->first()?->getAttribute('recorded_at');
        $lastRecordedAt = $orderedPoints->last()?->getAttribute('recorded_at');
        $recordedSeconds = $firstRecordedAt instanceof DateTimeInterface && $lastRecordedAt instanceof DateTimeInterface
            ? max(0, $lastRecordedAt->getTimestamp() - $firstRecordedAt->getTimestamp())
            : 0;
        $averageSpeed = $recordedSeconds > 0 ? $distance / ($recordedSeconds / 3600) : 0;
        $currentSpeed = $orderedPoints->last()?->speed_kmh;

        return [
            'distance_traveled_km' => round($distance, 3),
            'route_distance_km' => round($routeDistance, 3),
            'distance_remaining_km' => round($remaining, 3),
            'completion_percentage' => round($completion, 2),
            'average_speed_kmh' => round($averageSpeed, 3),
            'current_speed_kmh' => $currentSpeed === null ? null : round((float) $currentSpeed, 3),
            'elevation_gain_m' => round($elevationGain, 2),
            'estimated_remaining_seconds' => $averageSpeed > 0 ? (int) round(($remaining / $averageSpeed) * 3600) : null,
            'gps_points_count' => $orderedPoints->count(),
        ];
    }

    private function routeDistanceKm(?CyclingRoute $route): float
    {
        if ($route === null) {
            return 0.0;
        }

        $route->loadMissing('metrics');
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return $latestMetric === null ? 0.0 : (float) $latestMetric->distance_km;
    }

    private function elapsedSeconds(Track $track): int
    {
        $startedAt = $track->getAttribute('started_at');
        $endedAt = $track->getAttribute('ended_at') ?? now();

        if (! $startedAt instanceof DateTimeInterface || ! $endedAt instanceof DateTimeInterface) {
            return 0;
        }

        return max(0, $endedAt->getTimestamp() - $startedAt->getTimestamp());
    }

    private function haversineKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371.0;
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lonDelta / 2) ** 2;

        return $earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTrack(?Track $track, bool $includePoints): ?array
    {
        if ($track === null) {
            return null;
        }

        $track->loadMissing(['status:id,name', 'route:id,name,slug', 'gpsPoints']);
        $startedAt = $track->getAttribute('started_at');
        $endedAt = $track->getAttribute('ended_at');

        return [
            'id' => $track->id,
            'status' => $track->status === null ? null : ['id' => $track->status->id, 'name' => $track->status->name],
            'route' => $track->route === null ? null : ['id' => $track->route->id, 'name' => $track->route->name, 'slug' => $track->route->slug],
            'started_at' => $startedAt instanceof DateTimeInterface ? $startedAt->format(DATE_ATOM) : null,
            'ended_at' => $endedAt instanceof DateTimeInterface ? $endedAt->format(DATE_ATOM) : null,
            'distance_traveled_km' => (float) $track->distance_traveled_km,
            'total_time_seconds' => (int) $track->total_time_seconds,
            'completion_percentage' => (float) $track->completion_percentage,
            'is_valid' => (bool) $track->is_valid,
            'summary' => $track->summary ?? [],
            'gps_points_count' => $track->gpsPoints->count(),
            'points' => $includePoints ? $track->gpsPoints->map(fn (TrackGpsPoint $point): array => $this->serializePoint($point))->values()->all() : [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializePoint(TrackGpsPoint $point): array
    {
        $recordedAt = $point->getAttribute('recorded_at');

        return [
            'id' => $point->id,
            'latitude' => (float) $point->latitude,
            'longitude' => (float) $point->longitude,
            'elevation_m' => $point->elevation_m === null ? null : (float) $point->elevation_m,
            'speed_kmh' => $point->speed_kmh === null ? null : (float) $point->speed_kmh,
            'accuracy_m' => $point->accuracy_m === null ? null : (float) $point->accuracy_m,
            'recorded_at' => $recordedAt instanceof DateTimeInterface ? $recordedAt->format(DATE_ATOM) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toGeoJson(Track $track): array
    {
        return [
            'type' => 'FeatureCollection',
            'features' => [
                [
                    'type' => 'Feature',
                    'properties' => [
                        'track_id' => $track->id,
                        'route' => $track->route?->name,
                        'is_valid' => (bool) $track->is_valid,
                    ],
                    'geometry' => [
                        'type' => 'LineString',
                        'coordinates' => $track->gpsPoints
                            ->map(fn (TrackGpsPoint $point): array => [(float) $point->longitude, (float) $point->latitude])
                            ->values()
                            ->all(),
                    ],
                ],
            ],
        ];
    }

    private function toGpx(Track $track): string
    {
        $points = $track->gpsPoints->map(function (TrackGpsPoint $point): string {
            $recordedAt = $point->getAttribute('recorded_at');
            $time = $recordedAt instanceof DateTimeInterface ? $recordedAt->format(DATE_ATOM) : now()->format(DATE_ATOM);
            $elevation = $point->elevation_m === null ? '' : '<ele>'.e((string) $point->elevation_m).'</ele>';

            return '<trkpt lat="'.e((string) $point->latitude).'" lon="'.e((string) $point->longitude).'">'.$elevation.'<time>'.$time.'</time></trkpt>';
        })->implode('');

        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<gpx version="1.1" creator="Guaranda Go" xmlns="http://www.topografix.com/GPX/1/1">'
            .'<trk><name>'.e($track->route->name).'</name><trkseg>'
            .$points
            .'</trkseg></trk></gpx>';
    }
}
