<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\SyncOfflineEventsRequest;
use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentStatus;
use App\Models\SyncQueueEntry;
use App\Models\Track;
use App\Models\TrackGpsPoint;
use App\Models\TrackStatus;
use DateTimeImmutable;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SyncController extends Controller
{
    public function store(SyncOfflineEventsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $events = is_array($validated['events'] ?? null) ? $validated['events'] : [];
        $userId = $request->user()?->id;
        $results = [];

        foreach ($events as $event) {
            if (! is_array($event) || ! is_array($event['payload'] ?? null)) {
                continue;
            }

            $clientId = (string) $event['client_id'];
            $eventType = (string) $event['event_type'];
            /** @var array<string, mixed> $payload */
            $payload = $event['payload'];

            $alreadySynced = SyncQueueEntry::query()
                ->where('user_id', $userId)
                ->where('event_type', $eventType)
                ->where('payload->client_id', $clientId)
                ->where('status', 'enviado')
                ->exists();

            if ($alreadySynced) {
                $results[] = [
                    'client_id' => $clientId,
                    'event_type' => $eventType,
                    'status' => 'enviado',
                    'server_id' => null,
                ];

                continue;
            }

            /** @var SyncQueueEntry $queueEntry */
            $queueEntry = SyncQueueEntry::query()->create([
                'user_id' => $userId,
                'event_type' => $eventType,
                'payload' => array_merge(['client_id' => $clientId], $payload),
                'status' => 'pendiente',
                'attempts' => 1,
            ]);

            try {
                $serverId = DB::transaction(fn (): int => match ($eventType) {
                    'offline_incident_reported' => $this->syncIncident($userId, $payload),
                    'offline_track_completed' => $this->syncTrack($userId, $payload),
                    default => throw new \InvalidArgumentException('Tipo de evento no soportado.'),
                });

                $queueEntry->forceFill([
                    'status' => 'enviado',
                    'synced_at' => now(),
                ])->save();

                $results[] = [
                    'client_id' => $clientId,
                    'event_type' => $eventType,
                    'status' => 'enviado',
                    'server_id' => $serverId,
                ];
            } catch (Throwable $exception) {
                $queueEntry->forceFill([
                    'status' => 'error',
                    'last_error' => $exception->getMessage(),
                ])->save();

                $results[] = [
                    'client_id' => $clientId,
                    'event_type' => $eventType,
                    'status' => 'error',
                    'error' => $exception->getMessage(),
                ];
            }
        }

        return response()->json([
            'results' => $results,
            'server_time' => now()->toISOString(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncIncident(?int $userId, array $payload): int
    {
        if ($userId === null) {
            throw new \InvalidArgumentException('Usuario no autenticado.');
        }

        $status = IncidentStatus::query()->where('name', 'reportada')->firstOrFail();

        /** @var Incident $incident */
        $incident = Incident::query()->create([
            'user_id' => $userId,
            'route_id' => (int) $payload['route_id'],
            'incident_type_id' => (int) $payload['incident_type_id'],
            'incident_status_id' => $status->id,
            'title' => (string) $payload['title'],
            'description' => (string) $payload['description'],
            'latitude' => (float) $payload['latitude'],
            'longitude' => (float) $payload['longitude'],
            'reported_at' => isset($payload['reported_at']) ? new DateTimeImmutable((string) $payload['reported_at']) : now(),
        ]);

        $this->syncIncidentGeom($incident);
        $this->attachIncidentPhoto($incident, $payload);

        return $incident->id;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncTrack(?int $userId, array $payload): int
    {
        if ($userId === null) {
            throw new \InvalidArgumentException('Usuario no autenticado.');
        }

        /** @var CyclingRoute $route */
        $route = CyclingRoute::query()->with('metrics')->findOrFail((int) $payload['route_id']);
        $status = TrackStatus::query()->where('name', 'finalizado')->firstOrFail();
        $pointsPayload = is_array($payload['points'] ?? null) ? $payload['points'] : [];
        $points = collect($pointsPayload)->filter(fn (mixed $point): bool => is_array($point))->values();

        /** @var Track $track */
        $track = Track::query()->create([
            'user_id' => $userId,
            'route_id' => $route->id,
            'track_status_id' => $status->id,
            'started_at' => new DateTimeImmutable((string) $payload['started_at']),
            'ended_at' => new DateTimeImmutable((string) $payload['ended_at']),
            'distance_traveled_km' => 0,
            'total_time_seconds' => 0,
            'completion_percentage' => 0,
            'is_valid' => false,
        ]);

        foreach ($points as $pointPayload) {
            /** @var array<string, mixed> $pointPayload */
            /** @var TrackGpsPoint $point */
            $point = $track->gpsPoints()->create([
                'latitude' => (float) ($pointPayload['latitude'] ?? 0),
                'longitude' => (float) ($pointPayload['longitude'] ?? 0),
                'elevation_m' => isset($pointPayload['elevation_m']) ? (float) $pointPayload['elevation_m'] : null,
                'speed_kmh' => isset($pointPayload['speed_kmh']) ? (float) $pointPayload['speed_kmh'] : null,
                'accuracy_m' => isset($pointPayload['accuracy_m']) ? (float) $pointPayload['accuracy_m'] : null,
                'recorded_at' => isset($pointPayload['recorded_at']) ? new DateTimeImmutable((string) $pointPayload['recorded_at']) : now(),
            ]);

            $this->syncTrackPointGeom($point);
        }

        $track->load(['gpsPoints', 'route.metrics']);
        $summary = $this->calculateSummaryData($track->route, $track->gpsPoints);
        $isValid = $summary['completion_percentage'] >= 90;
        $elapsedSeconds = $this->elapsedSeconds($track);

        $track->forceFill([
            'distance_traveled_km' => $summary['distance_traveled_km'],
            'total_time_seconds' => $elapsedSeconds,
            'completion_percentage' => $summary['completion_percentage'],
            'is_valid' => $isValid,
            'summary' => [
                ...$summary,
                'total_time_seconds' => $elapsedSeconds,
                'is_valid_for_rating' => $isValid,
                'synced_from_offline' => true,
            ],
        ])->save();

        return $track->id;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function attachIncidentPhoto(Incident $incident, array $payload): void
    {
        if (! isset($payload['photo_base64']) || ! is_string($payload['photo_base64']) || $payload['photo_base64'] === '') {
            return;
        }

        $binary = base64_decode($payload['photo_base64'], true);

        if ($binary === false || strlen($binary) > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException('La foto offline no es válida o supera 5 MB.');
        }

        $name = isset($payload['photo_name']) && is_string($payload['photo_name']) ? basename($payload['photo_name']) : 'offline-photo.jpg';
        $path = 'incidents/offline-'.$incident->id.'-'.uniqid().'-'.$name;
        Storage::disk('public')->put($path, $binary);

        $incident->files()->create([
            'file_path' => $path,
            'file_type' => 'image',
            'size_bytes' => strlen($binary),
            'uploaded_at' => now(),
        ]);
    }

    private function syncIncidentGeom(Incident $incident): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('incidencias', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE incidencias SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?',
            [(float) $incident->longitude, (float) $incident->latitude, $incident->id]
        );
    }

    private function syncTrackPointGeom(TrackGpsPoint $point): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('puntos_gps_recorrido', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE puntos_gps_recorrido SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?',
            [(float) $point->longitude, (float) $point->latitude, $point->id]
        );
    }

    /**
     * @param  iterable<TrackGpsPoint>  $points
     * @return array{distance_traveled_km: float, route_distance_km: float, distance_remaining_km: float, completion_percentage: float, elevation_gain_m: float, gps_points_count: int}
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
                    $elevationGain += max(0, (float) $point->elevation_m - (float) $lastPoint->elevation_m);
                }
            }

            $lastPoint = $point;
        }

        $routeDistance = $this->routeDistanceKm($route);
        $completion = $routeDistance > 0 ? min(100, ($distance / $routeDistance) * 100) : 0;
        $remaining = max(0, $routeDistance - $distance);

        return [
            'distance_traveled_km' => round($distance, 3),
            'route_distance_km' => round($routeDistance, 3),
            'distance_remaining_km' => round($remaining, 3),
            'completion_percentage' => round($completion, 2),
            'elevation_gain_m' => round($elevationGain, 2),
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
}
