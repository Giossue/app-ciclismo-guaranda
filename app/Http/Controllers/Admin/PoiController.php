<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePoiRequest;
use App\Http\Requests\Admin\UpdatePoiRequest;
use App\Models\CuisineType;
use App\Models\CyclingRoute;
use App\Models\HealthCenterType;
use App\Models\LodgingType;
use App\Models\PoiCategory;
use App\Models\PoiHour;
use App\Models\PointOfInterest;
use App\Models\PoiReport;
use App\Models\PoiSuggestion;
use App\Models\PriceRange;
use App\Models\StoreType;
use App\Models\WorkshopDetail;
use App\Models\WorkshopService;
use App\Models\WorkshopSpecialty;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PoiController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', PointOfInterest::class);

        $pois = PointOfInterest::query()
            ->withTrashed()
            ->with(['category:id,name', 'routes:id,name,slug'])
            ->withCount(['routes', 'reports'])
            ->latest('id')
            ->paginate(12)
            ->through(fn (PointOfInterest $poi): array => $this->serializeSummary($poi));

        return Inertia::render('admin/pois/index', [
            'pois' => $pois,
            'pendingSuggestions' => PoiSuggestion::query()
                ->with(['category:id,name', 'user:id,name,last_name'])
                ->where('status', 'pendiente')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (PoiSuggestion $suggestion): array => $this->serializeSuggestion($suggestion)),
            'pendingReports' => PoiReport::query()
                ->with(['pointOfInterest:id,name', 'user:id,name,last_name'])
                ->where('status', 'pendiente')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (PoiReport $report): array => $this->serializeReport($report)),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PointOfInterest::class);

        return Inertia::render('admin/pois/create', [
            ...$this->catalogProps(),
        ]);
    }

    public function store(StorePoiRequest $request): RedirectResponse
    {
        $payload = $request->validated();

        DB::transaction(function () use ($payload): void {
            $poi = PointOfInterest::query()->create($this->poiAttributes($payload));
            $this->syncPoiPayload($poi, $payload);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('POI creado.')]);

        return to_route('admin.pois.index');
    }

    public function edit(PointOfInterest $poi): Response
    {
        $this->authorize('update', $poi);

        $poi->load([
            'category',
            'routes',
            'hours',
            'images',
            'foodDetail',
            'lodgingDetail',
            'storeDetail',
            'workshopDetail.services',
            'healthDetail',
        ]);

        return Inertia::render('admin/pois/edit', [
            ...$this->catalogProps(),
            'poi' => $this->serializeForm($poi),
        ]);
    }

    public function update(UpdatePoiRequest $request, PointOfInterest $poi): RedirectResponse
    {
        $payload = $request->validated();

        DB::transaction(function () use ($payload, $poi): void {
            $poi->fill($this->poiAttributes($payload))->save();
            $this->syncPoiPayload($poi, $payload);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('POI actualizado.')]);

        return to_route('admin.pois.index');
    }

    public function destroy(PointOfInterest $poi): RedirectResponse
    {
        $this->authorize('delete', $poi);

        $poi->forceFill(['active' => false])->save();
        $poi->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('POI deshabilitado.')]);

        return to_route('admin.pois.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function catalogProps(): array
    {
        return [
            'categories' => PoiCategory::query()->orderBy('id')->get(['id', 'name']),
            'routes' => CyclingRoute::query()->whereHas('status', fn ($query) => $query->whereIn('name', ['borrador', 'activa']))->orderBy('name')->get(['id', 'name']),
            'cuisineTypes' => CuisineType::query()->orderBy('name')->get(['id', 'name']),
            'priceRanges' => PriceRange::query()->orderBy('id')->get(['id', 'name']),
            'lodgingTypes' => LodgingType::query()->orderBy('name')->get(['id', 'name']),
            'storeTypes' => StoreType::query()->orderBy('name')->get(['id', 'name']),
            'workshopSpecialties' => WorkshopSpecialty::query()->orderBy('name')->get(['id', 'name']),
            'workshopServices' => WorkshopService::query()->orderBy('name')->get(['id', 'name']),
            'healthCenterTypes' => HealthCenterType::query()->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function poiAttributes(array $payload): array
    {
        return [
            'poi_category_id' => $payload['poi_category_id'],
            'name' => $payload['name'],
            'description' => $payload['description'] ?? null,
            'observations' => $payload['observations'] ?? null,
            'latitude' => $payload['latitude'],
            'longitude' => $payload['longitude'],
            'address' => $payload['address'] ?? null,
            'phone' => $payload['phone'] ?? null,
            'active' => (bool) ($payload['active'] ?? false),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncPoiPayload(PointOfInterest $poi, array $payload): void
    {
        $poi->refresh()->load('category');

        $this->syncPostgisPoint($poi);
        $this->syncHours($poi, $payload['hours_text'] ?? null);
        $this->syncImages($poi, $payload['images_text'] ?? null);
        $this->syncRoutes($poi, $payload['route_links_text'] ?? null);
        $this->syncCategoryDetails($poi, $payload);
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

    private function syncHours(PointOfInterest $poi, mixed $hoursText): void
    {
        $poi->hours()->delete();

        foreach ($this->splitLines($hoursText) as $line) {
            [$weekday, $opensAt, $closesAt, $description] = array_pad(explode('|', $line, 4), 4, null);

            $poi->hours()->create([
                'weekday' => (int) $weekday,
                'opens_at' => $opensAt === null || trim($opensAt) === '' ? null : trim($opensAt),
                'closes_at' => $closesAt === null || trim($closesAt) === '' ? null : trim($closesAt),
                'description' => $description === null || trim($description) === '' ? null : trim($description),
            ]);
        }
    }

    private function syncImages(PointOfInterest $poi, mixed $imagesText): void
    {
        $poi->images()->delete();

        foreach ($this->splitLines($imagesText) as $index => $line) {
            [$path, $description] = array_pad(explode('|', $line, 2), 2, null);

            if (trim($path) === '') {
                continue;
            }

            $poi->images()->create([
                'image_path' => trim($path),
                'description' => $description === null || trim($description) === '' ? null : trim($description),
                'sort_order' => $index,
            ]);
        }
    }

    private function syncRoutes(PointOfInterest $poi, mixed $routeLinksText): void
    {
        $syncPayload = [];

        foreach ($this->splitLines($routeLinksText) as $index => $line) {
            [$routeId, $required, $distance, $observation] = array_pad(explode('|', $line, 4), 4, null);

            $syncPayload[(int) $routeId] = [
                'sort_order' => $index + 1,
                'is_required' => in_array($required, ['1', 'si', 'sí'], true),
                'distance_from_start_km' => $distance === null || trim($distance) === '' ? null : (float) $distance,
                'route_observation' => $observation === null || trim($observation) === '' ? null : trim($observation),
            ];
        }

        $poi->routes()->sync($syncPayload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncCategoryDetails(PointOfInterest $poi, array $payload): void
    {
        $poi->foodDetail()->delete();
        $poi->lodgingDetail()->delete();
        $poi->storeDetail()->delete();
        $poi->healthDetail()->delete();

        if ($poi->workshopDetail !== null) {
            $poi->workshopDetail->services()->detach();
            $poi->workshopDetail()->delete();
        }

        $categoryName = $poi->category?->name;

        if ($categoryName === 'comida') {
            $poi->foodDetail()->create([
                'cuisine_type_id' => $payload['cuisine_type_id'] ?? null,
                'price_range_id' => $payload['price_range_id'] ?? null,
                'is_pet_friendly' => (bool) ($payload['is_pet_friendly'] ?? false),
                'has_wifi' => (bool) ($payload['has_wifi'] ?? false),
                'accepted_payment_type' => $payload['accepted_payment_type'] ?? null,
                'has_bike_parking' => (bool) ($payload['has_bike_parking'] ?? false),
                'chef_recommendation' => $payload['chef_recommendation'] ?? null,
                'menu_url' => $payload['menu_url'] ?? null,
            ]);
        }

        if ($categoryName === 'hospedaje') {
            $poi->lodgingDetail()->create([
                'lodging_type_id' => $payload['lodging_type_id'] ?? null,
                'allows_bikes_in_room' => (bool) ($payload['allows_bikes_in_room'] ?? false),
                'has_bike_wash_area' => (bool) ($payload['has_bike_wash_area'] ?? false),
                'base_price' => $payload['base_price'] ?? null,
            ]);
        }

        if ($categoryName === 'tienda') {
            $poi->storeDetail()->create([
                'store_type_id' => $payload['store_type_id'] ?? null,
                'sells_hydration' => (bool) ($payload['sells_hydration'] ?? false),
                'sells_snacks' => (bool) ($payload['sells_snacks'] ?? false),
                'accepted_payment_type' => $payload['accepted_payment_type'] ?? null,
            ]);
        }

        if ($categoryName === 'taller') {
            /** @var WorkshopDetail $workshopDetail */
            $workshopDetail = $poi->workshopDetail()->create([
                'workshop_specialty_id' => $payload['workshop_specialty_id'] ?? null,
                'emergency_service' => (bool) ($payload['emergency_service'] ?? false),
                'emergency_phone' => $payload['emergency_phone'] ?? null,
            ]);

            $workshopDetail->services()->sync(array_map('intval', $this->splitLines($payload['workshop_service_ids_text'] ?? null)));
        }

        if ($categoryName === 'salud') {
            $poi->healthDetail()->create([
                'health_center_type_id' => $payload['health_center_type_id'] ?? null,
                'has_defibrillator' => (bool) ($payload['has_defibrillator'] ?? false),
                'care_level' => $payload['care_level'] ?? null,
            ]);
        }
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
     * @return array<string, mixed>
     */
    private function serializeSummary(PointOfInterest $poi): array
    {
        return [
            'id' => $poi->id,
            'name' => $poi->name,
            'description' => Str::limit((string) $poi->description, 140),
            'latitude' => (float) $poi->latitude,
            'longitude' => (float) $poi->longitude,
            'active' => (bool) $poi->active && ! $poi->trashed(),
            'deleted_at' => $poi->deleted_at?->toISOString(),
            'category' => $poi->category === null ? null : ['id' => $poi->category->id, 'name' => $poi->category->name],
            'routes_count' => $poi->routes_count,
            'reports_count' => $poi->reports_count,
            'routes' => $poi->routes->map(fn (CyclingRoute $route): array => [
                'id' => $route->id,
                'name' => $route->name,
                'slug' => $route->slug,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeForm(PointOfInterest $poi): array
    {
        return [
            'id' => $poi->id,
            'poi_category_id' => $poi->poi_category_id,
            'name' => $poi->name,
            'description' => $poi->description,
            'observations' => $poi->observations,
            'latitude' => (string) $poi->latitude,
            'longitude' => (string) $poi->longitude,
            'address' => $poi->address,
            'phone' => $poi->phone,
            'active' => (bool) $poi->active && ! $poi->trashed(),
            'hours_text' => $poi->hours->map(fn (PoiHour $hour): string => implode('|', [
                $hour->weekday,
                $this->formatTimeValue($hour->getAttribute('opens_at')) ?? '',
                $this->formatTimeValue($hour->getAttribute('closes_at')) ?? '',
                $hour->description ?? '',
            ]))->implode("\n"),
            'images_text' => $poi->images->map(fn ($image): string => $image->description === null
                ? $image->image_path
                : "{$image->image_path}|{$image->description}")->implode("\n"),
            'route_links_text' => $poi->routes->map(function (CyclingRoute $route): string {
                $pivot = $route->getRelationValue('pivot');

                return implode('|', [
                    $route->id,
                    $pivot instanceof Pivot && (bool) $pivot->getAttribute('is_required') ? '1' : '0',
                    $pivot instanceof Pivot ? $pivot->getAttribute('distance_from_start_km') ?? '' : '',
                    $pivot instanceof Pivot ? $pivot->getAttribute('route_observation') ?? '' : '',
                ]);
            })->implode("\n"),
            'cuisine_type_id' => $poi->foodDetail?->cuisine_type_id,
            'price_range_id' => $poi->foodDetail?->price_range_id,
            'is_pet_friendly' => (bool) $poi->foodDetail?->is_pet_friendly,
            'has_wifi' => (bool) $poi->foodDetail?->has_wifi,
            'accepted_payment_type' => $poi->foodDetail !== null ? $poi->foodDetail->accepted_payment_type : $poi->storeDetail?->accepted_payment_type,
            'has_bike_parking' => (bool) $poi->foodDetail?->has_bike_parking,
            'chef_recommendation' => $poi->foodDetail?->chef_recommendation,
            'menu_url' => $poi->foodDetail?->menu_url,
            'lodging_type_id' => $poi->lodgingDetail?->lodging_type_id,
            'allows_bikes_in_room' => (bool) $poi->lodgingDetail?->allows_bikes_in_room,
            'has_bike_wash_area' => (bool) $poi->lodgingDetail?->has_bike_wash_area,
            'base_price' => $poi->lodgingDetail?->base_price,
            'store_type_id' => $poi->storeDetail?->store_type_id,
            'sells_hydration' => (bool) $poi->storeDetail?->sells_hydration,
            'sells_snacks' => (bool) $poi->storeDetail?->sells_snacks,
            'workshop_specialty_id' => $poi->workshopDetail?->workshop_specialty_id,
            'emergency_service' => (bool) $poi->workshopDetail?->emergency_service,
            'emergency_phone' => $poi->workshopDetail?->emergency_phone,
            'workshop_service_ids_text' => $poi->workshopDetail?->services->pluck('id')->implode("\n") ?? '',
            'health_center_type_id' => $poi->healthDetail?->health_center_type_id,
            'has_defibrillator' => (bool) $poi->healthDetail?->has_defibrillator,
            'care_level' => $poi->healthDetail?->care_level,
        ];
    }

    private function formatTimeValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format('H:i');
        }

        if (is_string($value) && $value !== '') {
            return substr($value, 0, 5);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSuggestion(PoiSuggestion $suggestion): array
    {
        return [
            'id' => $suggestion->id,
            'name' => $suggestion->name,
            'description' => Str::limit((string) $suggestion->description, 120),
            'status' => $suggestion->status,
            'category' => $suggestion->category === null ? null : ['id' => $suggestion->category->id, 'name' => $suggestion->category->name],
            'user' => $suggestion->user === null ? null : trim("{$suggestion->user->name} {$suggestion->user->last_name}"),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeReport(PoiReport $report): array
    {
        return [
            'id' => $report->id,
            'report_type' => $report->report_type,
            'description' => Str::limit((string) $report->description, 120),
            'status' => $report->status,
            'poi' => $report->pointOfInterest === null ? null : ['id' => $report->pointOfInterest->id, 'name' => $report->pointOfInterest->name],
            'user' => $report->user === null ? null : trim("{$report->user->name} {$report->user->last_name}"),
        ];
    }
}
