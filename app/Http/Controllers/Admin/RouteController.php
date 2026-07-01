<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRouteRequest;
use App\Http\Requests\Admin\UpdateRouteRequest;
use App\Models\CyclingRoute;
use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteGeometry;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\TransportMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RouteController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CyclingRoute::class);

        $routes = CyclingRoute::query()
            ->with(['status:id,name', 'category:id,name', 'difficulty:id,name', 'admin:id,name,last_name', 'metrics.transportMode:id,name'])
            ->latest('id')
            ->paginate(12)
            ->through(fn (CyclingRoute $route): array => $this->serializeRouteSummary($route));

        return Inertia::render('admin/routes/index', [
            'routes' => $routes,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CyclingRoute::class);

        return Inertia::render('admin/routes/create', [
            ...$this->catalogProps(),
            'defaultGeojson' => null,
        ]);
    }

    public function store(StoreRouteRequest $request): RedirectResponse
    {
        $payload = $this->storeUploadedRouteFiles($request, $request->validated());

        DB::transaction(function () use ($request, $payload): void {
            $route = CyclingRoute::query()->create([
                ...$this->routeAttributes($payload),
                'admin_user_id' => $request->user()?->id,
                'slug' => $this->uniqueSlug((string) $payload['name']),
                'route_version' => 1,
            ]);

            $this->syncRoutePayload($route, $payload);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruta creada.')]);

        return to_route('admin.routes.index');
    }

    public function edit(CyclingRoute $route): Response
    {
        $this->authorize('update', $route);

        $route->load(['geometry', 'metrics.routingEngine', 'metrics.transportMode', 'images', 'recommendations', 'observations', 'pointsOfInterest']);

        return Inertia::render('admin/routes/edit', [
            ...$this->catalogProps(),
            'route' => $this->serializeRouteForm($route),
        ]);
    }

    public function update(UpdateRouteRequest $request, CyclingRoute $route): RedirectResponse
    {
        $payload = $this->storeUploadedRouteFiles($request, $request->validated());

        DB::transaction(function () use ($payload, $route): void {
            $route->load(['geometry', 'metrics', 'images', 'recommendations', 'observations', 'pointsOfInterest']);
            $route->fill([
                ...$this->routeAttributes($payload),
                'slug' => $this->uniqueSlug((string) $payload['name'], $route->id),
            ]);

            if ($route->isDirty() || $this->relatedPayloadHasChanges($route, $payload)) {
                $route->route_version++;
            }

            $route->save();

            $this->syncRoutePayload($route, $payload);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruta actualizada.')]);

        return to_route('admin.routes.index');
    }

    public function destroy(CyclingRoute $route): RedirectResponse
    {
        $this->authorize('delete', $route);

        $inactiveStatus = RouteStatus::query()->where('name', 'inactiva')->firstOrFail();

        $route->forceFill([
            'route_status_id' => $inactiveStatus->id,
            'route_version' => $route->route_version + 1,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruta deshabilitada.')]);

        return to_route('admin.routes.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function catalogProps(): array
    {
        return [
            'statuses' => RouteStatus::query()->orderBy('id')->get(['id', 'name']),
            'categories' => RouteCategory::query()->orderBy('id')->get(['id', 'name']),
            'difficulties' => RouteDifficulty::query()->orderBy('id')->get(['id', 'name']),
            'transportModes' => TransportMode::query()->orderBy('id')->get(['id', 'name']),
            'routingEngines' => RoutingEngine::query()->where('active', true)->orderBy('id')->get(['id', 'name']),
            'poiCategories' => PoiCategory::query()->orderBy('name')->get(['id', 'name']),
            'pois' => PointOfInterest::query()
                ->with('category:id,name')
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'poi_category_id', 'name', 'latitude', 'longitude'])
                ->map(fn (PointOfInterest $poi): array => [
                    'id' => $poi->id,
                    'name' => $poi->name,
                    'latitude' => (float) $poi->latitude,
                    'longitude' => (float) $poi->longitude,
                    'category' => $poi->category === null ? null : ['id' => $poi->category->id, 'name' => $poi->category->name],
                ])
                ->values(),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function routeAttributes(array $payload): array
    {
        return [
            'route_difficulty_id' => $payload['route_difficulty_id'],
            'route_status_id' => $payload['route_status_id'],
            'route_category_id' => $payload['route_category_id'],
            'name' => $payload['name'],
            'description' => $payload['description'],
            'start_name' => $payload['start_name'],
            'start_latitude' => $payload['start_latitude'],
            'start_longitude' => $payload['start_longitude'],
            'end_name' => $payload['end_name'],
            'end_latitude' => $payload['end_latitude'],
            'end_longitude' => $payload['end_longitude'],
            'road_type' => $payload['road_type'],
            'required_experience' => $payload['required_experience'],
            'main_image_path' => $payload['main_image_path'],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncRoutePayload(CyclingRoute $route, array $payload): void
    {
        /** @var RouteGeometry $geometry */
        $geometry = $route->geometry()->updateOrCreate(
            ['route_id' => $route->id],
            ['geojson' => $payload['geojson']]
        );

        $this->syncPostgisGeometry($geometry);

        $route->metrics()->where('route_version', $route->route_version)->delete();
        $route->metrics()->create([
            'route_version' => $route->route_version,
            'transport_mode_id' => $payload['transport_mode_id'],
            'routing_engine_id' => $payload['routing_engine_id'] ?? null,
            'distance_km' => $payload['distance_km'],
            'estimated_time_minutes' => $payload['estimated_time_minutes'],
            'positive_elevation_m' => $payload['positive_elevation_m'],
            'negative_elevation_m' => $payload['negative_elevation_m'],
            'calculated_at' => now(),
        ]);

        $route->recommendations()->delete();
        foreach ($this->splitLines($payload['recommendations_text']) as $text) {
            $route->recommendations()->create(['text' => $text]);
        }

        $route->observations()->delete();
        foreach ($this->splitLines($payload['observations_text']) as $text) {
            $route->observations()->create(['text' => $text]);
        }

        $route->images()->delete();
        foreach ($this->imageRows($payload) as $imageRow) {
            $route->images()->create($imageRow);
        }

        $poiIds = [
            ...$this->normalizedPoiIds($payload),
            ...$this->createRoutePois($payload),
        ];

        $route->pointsOfInterest()->sync($this->poiSyncRowsFromIds($poiIds));
    }

    private function syncPostgisGeometry(RouteGeometry $geometry): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('geometrias_ruta', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE geometrias_ruta SET geom = ST_SetSRID(ST_GeomFromGeoJSON(?), 4326) WHERE id = ?',
            [$this->encode($geometry->geojson), $geometry->id]
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function relatedPayloadHasChanges(CyclingRoute $route, array $payload): bool
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return $this->encode($route->geometry?->geojson) !== $this->encode($payload['geojson'])
            || $latestMetric === null
            || (int) $latestMetric->transport_mode_id !== (int) $payload['transport_mode_id']
            || (string) $latestMetric->routing_engine_id !== (string) ($payload['routing_engine_id'] ?? '')
            || abs((float) $latestMetric->distance_km - (float) $payload['distance_km']) > 0.0001
            || (int) $latestMetric->estimated_time_minutes !== (int) $payload['estimated_time_minutes']
            || abs((float) $latestMetric->positive_elevation_m - (float) $payload['positive_elevation_m']) > 0.0001
            || abs((float) $latestMetric->negative_elevation_m - (float) $payload['negative_elevation_m']) > 0.0001
            || $route->recommendations->pluck('text')->values()->all() !== $this->splitLines($payload['recommendations_text'])
            || $route->observations->pluck('text')->values()->all() !== $this->splitLines($payload['observations_text'])
            || $this->existingImageRows($route) !== $this->imageRows($payload)
            || $this->hasNewRoutePois($payload)
            || $route->pointsOfInterest->pluck('id')->map(fn ($id): int => (int) $id)->sort()->values()->all() !== $this->normalizedPoiIds($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{image_path: string, description: string|null, is_main: bool, sort_order: int}>
     */
    private function imageRows(array $payload): array
    {
        $rows = [];

        if (filled($payload['main_image_path'] ?? null)) {
            $rows[] = [
                'image_path' => (string) $payload['main_image_path'],
                'description' => null,
                'is_main' => true,
                'sort_order' => 0,
            ];
        }

        foreach ($this->splitLines($payload['additional_images_text'] ?? null) as $index => $line) {
            [$path, $description] = array_pad(explode('|', $line, 2), 2, null);

            $rows[] = [
                'image_path' => trim($path),
                'description' => $description === null || trim($description) === '' ? null : trim($description),
                'is_main' => false,
                'sort_order' => $index + 1,
            ];
        }

        $uploadedImages = is_array($payload['uploaded_additional_images'] ?? null)
            ? $payload['uploaded_additional_images']
            : [];

        foreach ($uploadedImages as $index => $path) {
            if (! is_string($path) || $path === '') {
                continue;
            }

            $rows[] = [
                'image_path' => $path,
                'description' => null,
                'is_main' => false,
                'sort_order' => count($rows) + $index + 1,
            ];
        }

        return array_values(array_filter($rows, fn (array $row): bool => $row['image_path'] !== ''));
    }

    /**
     * @return list<array{image_path: string, description: string|null, is_main: bool, sort_order: int}>
     */
    private function existingImageRows(CyclingRoute $route): array
    {
        $rows = [];

        foreach ($route->images as $image) {
            $rows[] = [
                'image_path' => (string) $image->image_path,
                'description' => $image->description === null ? null : (string) $image->description,
                'is_main' => (bool) $image->is_main,
                'sort_order' => (int) $image->sort_order,
            ];
        }

        return $rows;
    }

    /**
     * @param  list<int>  $ids
     * @return array<int, array{sort_order: int, is_required: bool, distance_from_start_km: null, route_observation: null}>
     */
    private function poiSyncRowsFromIds(array $ids): array
    {
        $rows = [];

        foreach (array_values(array_unique($ids)) as $index => $id) {
            $rows[$id] = [
                'sort_order' => $index + 1,
                'is_required' => false,
                'distance_from_start_km' => null,
                'route_observation' => null,
            ];
        }

        return $rows;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<int>
     */
    private function createRoutePois(array $payload): array
    {
        $createdIds = [];

        foreach ($this->normalizedNewPois($payload) as $poiPayload) {
            /** @var PointOfInterest $poi */
            $poi = PointOfInterest::query()->create([
                'poi_category_id' => $poiPayload['poi_category_id'],
                'name' => $poiPayload['name'],
                'description' => $poiPayload['description'],
                'observations' => null,
                'latitude' => $poiPayload['latitude'],
                'longitude' => $poiPayload['longitude'],
                'address' => null,
                'phone' => null,
                'active' => true,
            ]);

            $this->syncPostgisPoint($poi);
            $createdIds[] = $poi->id;
        }

        return $createdIds;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function hasNewRoutePois(array $payload): bool
    {
        return $this->normalizedNewPois($payload) !== [];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{name: string, poi_category_id: int, description: string|null, latitude: float, longitude: float}>
     */
    private function normalizedNewPois(array $payload): array
    {
        $pois = is_array($payload['new_pois'] ?? null) ? $payload['new_pois'] : [];
        $normalized = [];

        foreach ($pois as $poi) {
            if (! is_array($poi) || trim((string) ($poi['name'] ?? '')) === '') {
                continue;
            }

            $normalized[] = [
                'name' => trim((string) $poi['name']),
                'poi_category_id' => (int) $poi['poi_category_id'],
                'description' => isset($poi['description']) && trim((string) $poi['description']) !== ''
                    ? trim((string) $poi['description'])
                    : null,
                'latitude' => (float) $poi['latitude'],
                'longitude' => (float) $poi['longitude'],
            ];
        }

        return $normalized;
    }

    private function syncPostgisPoint(PointOfInterest $poi): void
    {
        if (DB::getDriverName() !== 'pgsql' || ! Schema::hasColumn('puntos_interes', 'geom')) {
            return;
        }

        DB::statement(
            'UPDATE puntos_interes SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?',
            [(float) $poi->longitude, (float) $poi->latitude, $poi->id]
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, int>
     */
    private function normalizedPoiIds(array $payload): array
    {
        $ids = is_array($payload['poi_ids'] ?? null) ? $payload['poi_ids'] : [];

        return collect($ids)
            ->map(fn ($id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    private function splitLines(mixed $text): array
    {
        if (! is_string($text)) {
            return [];
        }

        $lines = preg_split('/\R/u', trim($text)) ?: [];

        return array_values(array_filter(array_map('trim', $lines), fn (string $line): bool => $line !== ''));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function storeUploadedRouteFiles(FormRequest $request, array $payload): array
    {
        $mainImage = $request->file('main_image');

        if ($mainImage instanceof UploadedFile) {
            $payload['main_image_path'] = $mainImage->store('routes', 'public');
        }

        $payload['uploaded_additional_images'] = [];
        $additionalImages = $request->file('additional_images');

        if ($additionalImages instanceof UploadedFile) {
            $payload['uploaded_additional_images'][] = $additionalImages->store('routes', 'public');

            return $payload;
        }

        if ($additionalImages === null) {
            return $payload;
        }

        foreach ($additionalImages as $image) {
            $payload['uploaded_additional_images'][] = $image->store('routes', 'public');
        }

        return $payload;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'ruta';
        $slug = $baseSlug;
        $counter = 2;

        while (CyclingRoute::withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRouteSummary(CyclingRoute $route): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'slug' => $route->slug,
            'description' => Str::limit($route->description, 160),
            'start_name' => $route->start_name,
            'end_name' => $route->end_name,
            'main_image_path' => $route->main_image_path,
            'route_version' => $route->route_version,
            'status' => $route->status === null ? null : ['id' => $route->status->id, 'name' => $route->status->name],
            'category' => $route->category === null ? null : ['id' => $route->category->id, 'name' => $route->category->name],
            'difficulty' => $route->difficulty === null ? null : ['id' => $route->difficulty->id, 'name' => $route->difficulty->name],
            'admin' => $route->admin === null ? null : [
                'id' => $route->admin->id,
                'name' => trim("{$route->admin->name} {$route->admin->last_name}"),
            ],
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                'transport_mode' => $latestMetric->transportMode?->name,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRouteForm(CyclingRoute $route): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();
        $additionalImages = $route->images
            ->where('is_main', false)
            ->map(fn ($image): string => $image->description === null
                ? $image->image_path
                : "{$image->image_path}|{$image->description}")
            ->values()
            ->implode("\n");

        return [
            'id' => $route->id,
            'route_status_id' => $route->route_status_id,
            'route_category_id' => $route->route_category_id,
            'route_difficulty_id' => $route->route_difficulty_id,
            'name' => $route->name,
            'description' => $route->description,
            'start_name' => $route->start_name,
            'start_latitude' => (string) $route->start_latitude,
            'start_longitude' => (string) $route->start_longitude,
            'end_name' => $route->end_name,
            'end_latitude' => (string) $route->end_latitude,
            'end_longitude' => (string) $route->end_longitude,
            'road_type' => $route->road_type,
            'required_experience' => $route->required_experience,
            'main_image_path' => $route->main_image_path,
            'route_version' => $route->route_version,
            'geojson' => $route->geometry === null ? '' : $this->encodePretty($route->geometry->geojson),
            'transport_mode_id' => $latestMetric?->transport_mode_id,
            'routing_engine_id' => $latestMetric?->routing_engine_id,
            'distance_km' => $latestMetric?->distance_km,
            'estimated_time_minutes' => $latestMetric?->estimated_time_minutes,
            'positive_elevation_m' => $latestMetric?->positive_elevation_m,
            'negative_elevation_m' => $latestMetric?->negative_elevation_m,
            'recommendations_text' => $route->recommendations->pluck('text')->implode("\n"),
            'observations_text' => $route->observations->pluck('text')->implode("\n"),
            'additional_images_text' => $additionalImages,
            'poi_ids' => $route->pointsOfInterest->pluck('id')->map(fn ($id): int => (int) $id)->values()->all(),
        ];
    }

    private function encode(mixed $value): string
    {
        return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    }

    private function encodePretty(mixed $value): string
    {
        return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
