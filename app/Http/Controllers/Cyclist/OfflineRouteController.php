<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreRouteDownloadRequest;
use App\Models\CyclingRoute;
use App\Models\ExportFormat;
use App\Models\Incident;
use App\Models\PointOfInterest;
use App\Models\RouteDownload;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfflineRouteController extends Controller
{
    public function show(Request $request, CyclingRoute $route): JsonResponse
    {
        abort_unless($route->status?->name === 'activa', 404);

        $route->load([
            'status:id,name',
            'category:id,name',
            'difficulty:id,name',
            'geometry',
            'metrics.transportMode:id,name',
            'recommendations',
            'observations',
            'pointsOfInterest' => fn ($query) => $query->where('active', true)->with(['category:id,name', 'hours', 'images']),
            'incidents' => fn ($query) => $query
                ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'en revisión'))
                ->with(['type:id,name', 'status:id,name', 'files'])
                ->latest('reported_at'),
        ]);

        $download = RouteDownload::query()
            ->where('user_id', $request->user()?->id)
            ->where('route_id', $route->id)
            ->latest('id')
            ->first();

        return response()->json([
            'server_time' => now()->toISOString(),
            'route' => $this->serializeRoutePackage($route),
            'download' => $download === null ? null : $this->serializeDownload($download, $route),
            'map' => [
                'status' => 'pendiente',
                'description' => 'El paquete cartográfico offline de Ecuador se integrará en la fase Android/Capacitor.',
                'estimated_size_mb' => null,
            ],
        ]);
    }

    public function store(StoreRouteDownloadRequest $request, CyclingRoute $route): JsonResponse
    {
        abort_unless($route->status?->name === 'activa', 404);

        $userId = $request->user()?->id;
        abort_if($userId === null, 403);

        $payload = $request->validated();
        $format = ExportFormat::query()->where('name', 'GeoJSON')->first();
        $status = (string) ($payload['download_status'] ?? 'completada');

        $download = RouteDownload::query()->updateOrCreate(
            [
                'user_id' => $userId,
                'route_id' => $route->id,
            ],
            [
                'export_format_id' => $format?->id,
                'route_version' => $route->route_version,
                'download_status' => $status,
                'size_mb' => $payload['size_mb'] ?? null,
                'downloaded_at' => $status === 'completada' ? now() : null,
                'local_deleted_at' => $status === 'eliminada' ? now() : null,
            ]
        );

        return response()->json([
            'download' => $this->serializeDownload($download, $route),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRoutePackage(CyclingRoute $route): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'slug' => $route->slug,
            'route_version' => $route->route_version,
            'description' => $route->description,
            'start_name' => $route->start_name,
            'start_latitude' => (float) $route->start_latitude,
            'start_longitude' => (float) $route->start_longitude,
            'end_name' => $route->end_name,
            'end_latitude' => (float) $route->end_latitude,
            'end_longitude' => (float) $route->end_longitude,
            'road_type' => $route->road_type,
            'main_image_path' => $route->main_image_path,
            'geojson' => $route->geometry?->geojson,
            'category' => $route->category === null ? null : ['id' => $route->category->id, 'name' => $route->category->name],
            'difficulty' => $route->difficulty === null ? null : ['id' => $route->difficulty->id, 'name' => $route->difficulty->name],
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                'positive_elevation_m' => (float) $latestMetric->positive_elevation_m,
                'negative_elevation_m' => (float) $latestMetric->negative_elevation_m,
                'transport_mode' => $latestMetric->transportMode?->name,
            ],
            'recommendations' => $route->recommendations->pluck('text')->values()->all(),
            'observations' => $route->observations->pluck('text')->values()->all(),
            'points_of_interest' => $route->pointsOfInterest
                ->map(fn (PointOfInterest $poi): array => $this->serializePointOfInterest($poi))
                ->values()
                ->all(),
            'incidents' => $route->incidents
                ->map(fn (Incident $incident): array => $this->serializeIncident($incident))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializePointOfInterest(PointOfInterest $poi): array
    {
        $pivot = $poi->getRelationValue('pivot');

        return [
            'id' => $poi->id,
            'name' => $poi->name,
            'description' => $poi->description,
            'observations' => $poi->observations,
            'address' => $poi->address,
            'phone' => $poi->phone,
            'latitude' => (float) $poi->latitude,
            'longitude' => (float) $poi->longitude,
            'category' => $poi->category === null ? null : ['id' => $poi->category->id, 'name' => $poi->category->name],
            'is_required' => $pivot instanceof Pivot ? (bool) $pivot->getAttribute('is_required') : false,
            'distance_from_start_km' => $pivot instanceof Pivot && $pivot->getAttribute('distance_from_start_km') !== null ? (float) $pivot->getAttribute('distance_from_start_km') : null,
            'route_observation' => $pivot instanceof Pivot ? $pivot->getAttribute('route_observation') : null,
            'hours' => $poi->hours->map(fn ($hour): array => [
                'weekday' => $hour->weekday,
                'opens_at' => $hour->opens_at,
                'closes_at' => $hour->closes_at,
                'description' => $hour->description,
            ])->values()->all(),
            'images' => $poi->images->map(fn ($image): array => [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'description' => $image->description,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeIncident(Incident $incident): array
    {
        $reportedAt = $incident->getAttribute('reported_at');

        return [
            'id' => $incident->id,
            'title' => $incident->title,
            'description' => $incident->description,
            'latitude' => (float) $incident->latitude,
            'longitude' => (float) $incident->longitude,
            'type' => $incident->type === null ? null : ['id' => $incident->type->id, 'name' => $incident->type->name],
            'status' => $incident->status === null ? null : ['id' => $incident->status->id, 'name' => $incident->status->name],
            'reported_at' => $reportedAt instanceof DateTimeInterface ? $reportedAt->format(DATE_ATOM) : null,
            'files' => $incident->files->map(fn ($file): array => [
                'id' => $file->id,
                'file_path' => $file->file_path,
                'file_type' => $file->file_type,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDownload(RouteDownload $download, CyclingRoute $route): array
    {
        $downloadedAt = $download->getAttribute('downloaded_at');
        $localDeletedAt = $download->getAttribute('local_deleted_at');

        return [
            'id' => $download->id,
            'route_id' => $download->route_id,
            'route_version' => $download->route_version,
            'current_route_version' => $route->route_version,
            'is_outdated' => $download->route_version < $route->route_version,
            'download_status' => $download->download_status,
            'size_mb' => $download->size_mb === null ? null : (float) $download->size_mb,
            'downloaded_at' => $downloadedAt instanceof DateTimeInterface ? $downloadedAt->format(DATE_ATOM) : null,
            'local_deleted_at' => $localDeletedAt instanceof DateTimeInterface ? $localDeletedAt->format(DATE_ATOM) : null,
        ];
    }
}
