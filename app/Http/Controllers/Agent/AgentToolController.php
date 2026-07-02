<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\PoiHour;
use App\Models\PointOfInterest;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class AgentToolController extends Controller
{
    public function routes(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'intent' => ['nullable', 'string', 'in:list,recommend,detail,alerts,search'],
            'route_id' => ['nullable', 'integer'],
            'route_slug' => ['nullable', 'string', 'max:160'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'location' => ['nullable', 'array'],
            'location.latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:location.longitude'],
            'location.longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:location.latitude'],
            'max_results' => ['nullable', 'integer', 'min:1', 'max:10'],
            'difficulty' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'query' => ['nullable', 'string', 'max:120'],
        ]);

        [$latitude, $longitude] = $this->coordinatesFromPayload($payload);
        $route = $this->routeFromPayload($payload);
        $intent = $payload['intent'] ?? null;

        if ($route !== null) {
            $distanceMeters = $latitude !== null && $longitude !== null
                ? $this->distanceFromUserToRouteMeters($route, $latitude, $longitude)
                : null;

            return response()->json([
                'mode' => $intent === 'alerts' ? 'alerts' : 'detail',
                'selected_route' => $this->serializeRouteDetail($route, $distanceMeters),
                'routes' => [],
                'summary' => [
                    'total' => 1,
                    'has_location' => $latitude !== null && $longitude !== null,
                    'sorted_by' => 'selected_route',
                ],
            ]);
        }

        $limit = (int) ($payload['max_results'] ?? 5);
        $routes = $this->searchRouteDetails($payload, $latitude, $longitude, $limit);

        if ($routes === [] && isset($payload['query'])) {
            $fallbackPayload = $payload;
            unset($fallbackPayload['query']);

            $routes = $this->searchRouteDetails($fallbackPayload, $latitude, $longitude, $limit);
        }

        return response()->json([
            'mode' => $intent ?? (isset($payload['query']) ? 'search' : 'list'),
            'selected_route' => null,
            'routes' => $routes,
            'summary' => [
                'total' => count($routes),
                'has_location' => $latitude !== null && $longitude !== null,
                'sorted_by' => $latitude !== null && $longitude !== null ? 'distance' : 'default',
            ],
        ]);
    }

    public function pois(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'location' => ['nullable', 'array'],
            'location.latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:location.longitude'],
            'location.longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:location.latitude'],
            'route_id' => ['nullable', 'integer'],
            'route_slug' => ['nullable', 'string', 'max:160'],
            'category' => ['nullable', 'string', 'max:80'],
            'query' => ['nullable', 'string', 'max:120'],
            'max_results' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        [$latitude, $longitude] = $this->coordinatesFromPayload($payload);
        $route = $this->routeFromPayload($payload);
        $pois = $this->searchPoiCards($payload, $latitude, $longitude, (int) ($payload['max_results'] ?? 5), $route);

        return response()->json([
            'pois' => $pois,
            'summary' => [
                'total' => count($pois),
                'has_location' => $latitude !== null && $longitude !== null,
                'route_filtered' => $route !== null,
            ],
        ]);
    }

    public function searchRoutes(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'max_results' => ['nullable', 'integer', 'min:1', 'max:10'],
            'difficulty' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'query' => ['nullable', 'string', 'max:120'],
        ]);

        $latitude = $this->optionalFloat($payload, 'latitude');
        $longitude = $this->optionalFloat($payload, 'longitude');
        $limit = (int) ($payload['max_results'] ?? 5);

        $routes = $this->searchRouteCards($payload, $latitude, $longitude, $limit);

        if ($routes === [] && isset($payload['query'])) {
            $fallbackPayload = $payload;
            unset($fallbackPayload['query']);

            $routes = $this->searchRouteCards($fallbackPayload, $latitude, $longitude, $limit);
        }

        return response()->json([
            'routes' => $routes,
        ]);
    }

    public function showRoute(string $route): JsonResponse
    {
        $cyclingRoute = $this->findActiveRoute($route);

        abort_if($cyclingRoute === null, 404);

        return response()->json([
            'route' => $this->serializeRouteDetail($cyclingRoute),
        ]);
    }

    public function searchPois(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
            'route_id' => ['nullable', 'integer'],
            'route_slug' => ['nullable', 'string', 'max:160'],
            'category' => ['nullable', 'string', 'max:80'],
            'query' => ['nullable', 'string', 'max:120'],
            'max_results' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        [$latitude, $longitude] = $this->coordinatesFromPayload($payload);
        $route = $this->routeFromPayload($payload);

        return response()->json([
            'pois' => $this->searchPoiCards($payload, $latitude, $longitude, (int) ($payload['max_results'] ?? 5), $route),
        ]);
    }

    public function routeProgress(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'route_id' => ['nullable', 'integer', 'required_without:route_slug'],
            'route_slug' => ['nullable', 'string', 'max:160', 'required_without:route_id'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $route = $this->routeFromPayload($payload);
        abort_if($route === null, 404);

        $latitude = (float) $payload['latitude'];
        $longitude = (float) $payload['longitude'];
        $line = $this->routeLineCoordinates($route);
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();
        $totalDistanceKm = $latestMetric === null ? null : (float) $latestMetric->distance_km;
        $progress = $line === []
            ? null
            : $this->progressOnLine($line, $latitude, $longitude, $totalDistanceKm);

        $fallbackDistanceToStartMeters = $this->haversineMeters($latitude, $longitude, (float) $route->start_latitude, (float) $route->start_longitude);
        $fallbackDistanceToEndMeters = $this->haversineMeters($latitude, $longitude, (float) $route->end_latitude, (float) $route->end_longitude);

        return response()->json([
            'progress' => [
                'type' => 'progress',
                'route_id' => $route->id,
                'route_slug' => $route->slug,
                'route_name' => $route->name,
                'nearest_point_distance_m' => $progress === null ? null : round($progress['nearest_point_distance_m'], 1),
                'progress_percentage' => $progress === null ? null : round($progress['progress_percentage'], 1),
                'remaining_distance_km' => $progress === null ? null : round($progress['remaining_distance_km'], 2),
                'distance_to_start_km' => round($fallbackDistanceToStartMeters / 1000, 2),
                'distance_to_end_km' => round($fallbackDistanceToEndMeters / 1000, 2),
                'message' => $progress === null
                    ? 'No hay trazado suficiente para estimar el avance sobre la ruta.'
                    : 'Vas aproximadamente al '.round($progress['progress_percentage']).'% de la ruta.',
            ],
        ]);
    }

    public function routeAlerts(string $route): JsonResponse
    {
        $cyclingRoute = $this->findActiveRoute($route);
        abort_if($cyclingRoute === null, 404);

        $alerts = $cyclingRoute->incidents
            ->map(fn (Incident $incident): array => $this->serializeAlert($incident))
            ->values()
            ->all();

        return response()->json([
            'alerts' => $alerts,
        ]);
    }

    /**
     * @return Builder<CyclingRoute>
     */
    private function activeRoutesQuery(): Builder
    {
        return CyclingRoute::query()
            ->with([
                'status:id,name',
                'category:id,name',
                'difficulty:id,name',
                'geometry',
                'metrics.transportMode:id,name',
                'recommendations',
                'observations',
                'images',
                'pointsOfInterest' => fn ($query) => $query->where('active', true)->with(['category:id,name', 'hours', 'images']),
                'incidents' => fn ($query) => $query
                    ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'en revisión'))
                    ->with(['type:id,name', 'status:id,name'])
                    ->latest('reported_at'),
            ])
            ->whereHas('status', fn ($query) => $query->where('name', 'activa'));
    }

    private function findActiveRoute(string $route): ?CyclingRoute
    {
        return $this->activeRoutesQuery()
            ->where(function (Builder $query) use ($route): void {
                $query->where('slug', $route);

                if (ctype_digit($route)) {
                    $query->orWhere('id', (int) $route);
                }
            })
            ->first();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array<string, mixed>>
     */
    private function searchRouteDetails(array $payload, ?float $latitude, ?float $longitude, int $limit): array
    {
        return $this->activeRoutesQuery()
            ->when(isset($payload['difficulty']), fn (Builder $query) => $query->whereHas('difficulty', fn (Builder $difficultyQuery) => $difficultyQuery->where('name', 'like', '%'.$payload['difficulty'].'%')))
            ->when(isset($payload['category']), fn (Builder $query) => $query->whereHas('category', fn (Builder $categoryQuery) => $categoryQuery->where('name', 'like', '%'.$payload['category'].'%')))
            ->when(isset($payload['query']), fn (Builder $query) => $query->where(function (Builder $textQuery) use ($payload): void {
                $textQuery->where('name', 'like', '%'.$payload['query'].'%')
                    ->orWhere('description', 'like', '%'.$payload['query'].'%')
                    ->orWhere('start_name', 'like', '%'.$payload['query'].'%')
                    ->orWhere('end_name', 'like', '%'.$payload['query'].'%');
            }))
            ->get()
            ->map(function (CyclingRoute $route) use ($latitude, $longitude): array {
                $distanceMeters = $latitude !== null && $longitude !== null
                    ? $this->distanceFromUserToRouteMeters($route, $latitude, $longitude)
                    : null;

                return [
                    ...$this->serializeRouteDetail($route, $distanceMeters),
                    '_sort_distance_m' => $distanceMeters,
                ];
            })
            ->sortBy(fn (array $route): float|int => $route['_sort_distance_m'] ?? $route['id'])
            ->take($limit)
            ->map(function (array $route): array {
                unset($route['_sort_distance_m']);

                return $route;
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array<string, mixed>>
     */
    private function searchRouteCards(array $payload, ?float $latitude, ?float $longitude, int $limit): array
    {
        return $this->activeRoutesQuery()
            ->when(isset($payload['difficulty']), fn (Builder $query) => $query->whereHas('difficulty', fn (Builder $difficultyQuery) => $difficultyQuery->where('name', 'like', '%'.$payload['difficulty'].'%')))
            ->when(isset($payload['category']), fn (Builder $query) => $query->whereHas('category', fn (Builder $categoryQuery) => $categoryQuery->where('name', 'like', '%'.$payload['category'].'%')))
            ->when(isset($payload['query']), fn (Builder $query) => $query->where(function (Builder $textQuery) use ($payload): void {
                $textQuery->where('name', 'like', '%'.$payload['query'].'%')
                    ->orWhere('description', 'like', '%'.$payload['query'].'%')
                    ->orWhere('start_name', 'like', '%'.$payload['query'].'%')
                    ->orWhere('end_name', 'like', '%'.$payload['query'].'%');
            }))
            ->get()
            ->map(function (CyclingRoute $route) use ($latitude, $longitude): array {
                $distanceMeters = $latitude !== null && $longitude !== null
                    ? $this->distanceFromUserToRouteMeters($route, $latitude, $longitude)
                    : null;

                return [
                    ...$this->serializeRouteCard($route, $distanceMeters),
                    '_sort_distance_m' => $distanceMeters,
                ];
            })
            ->sortBy(fn (array $route): float|int => $route['_sort_distance_m'] ?? $route['id'])
            ->take($limit)
            ->map(function (array $route): array {
                unset($route['_sort_distance_m']);

                return $route;
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function routeFromPayload(array $payload): ?CyclingRoute
    {
        $identifier = $payload['route_slug'] ?? $payload['route_id'] ?? null;

        if ($identifier === null || $identifier === '') {
            return null;
        }

        return $this->findActiveRoute((string) $identifier);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRouteCard(CyclingRoute $route, ?float $distanceMeters): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();
        $meta = array_values(array_filter([
            $latestMetric === null ? null : number_format((float) $latestMetric->distance_km, 1).' km',
            $latestMetric === null ? null : $latestMetric->estimated_time_minutes.' min',
            $latestMetric === null ? null : '+'.number_format((float) $latestMetric->positive_elevation_m, 0).' m',
            $route->difficulty?->name,
        ]));

        $recommendations = $route->recommendations->pluck('text')->take(6)->values()->all();
        $observations = $route->observations->pluck('text')->take(6)->values()->all();

        return [
            'type' => 'route',
            'id' => $route->id,
            'title' => $route->name,
            'subtitle' => collect([$route->category?->name, $route->difficulty?->name])->filter()->implode(' · '),
            'description' => $distanceMeters === null
                ? Str::limit($route->description, 160)
                : 'A '.number_format($distanceMeters / 1000, 2).' km de tu ubicación.',
            'href' => '/routes/'.$route->slug,
            'image_url' => $this->publicImageUrl($route->main_image_path),
            'meta' => $meta,
            'distance_from_user_km' => $distanceMeters === null ? null : round($distanceMeters / 1000, 2),
            'recommendations' => $recommendations,
            'observations' => $observations,
            'route' => [
                'slug' => $route->slug,
                'start' => $route->start_name,
                'end' => $route->end_name,
                'metric' => $latestMetric === null ? null : [
                    'distance_km' => (float) $latestMetric->distance_km,
                    'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                    'positive_elevation_m' => (float) $latestMetric->positive_elevation_m,
                    'negative_elevation_m' => (float) $latestMetric->negative_elevation_m,
                ],
                'recommendations' => $recommendations,
                'observations' => $observations,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRouteDetail(CyclingRoute $route, ?float $distanceMeters = null): array
    {
        $card = $this->serializeRouteCard($route, $distanceMeters);
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            ...$card,
            'description' => $route->description,
            'start' => [
                'name' => $route->start_name,
                'latitude' => (float) $route->start_latitude,
                'longitude' => (float) $route->start_longitude,
            ],
            'end' => [
                'name' => $route->end_name,
                'latitude' => (float) $route->end_latitude,
                'longitude' => (float) $route->end_longitude,
            ],
            'road_type' => $route->road_type,
            'required_experience' => $route->required_experience,
            'geojson' => $route->geometry?->geojson,
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                'positive_elevation_m' => (float) $latestMetric->positive_elevation_m,
                'negative_elevation_m' => (float) $latestMetric->negative_elevation_m,
                'transport_mode' => $latestMetric->transportMode?->name,
            ],
            'recommendations' => $route->recommendations->pluck('text')->values()->all(),
            'observations' => $route->observations->pluck('text')->values()->all(),
            'pois' => $route->pointsOfInterest->map(fn (PointOfInterest $poi): array => $this->serializePoiCard($poi, null, $route))->values()->all(),
            'alerts' => $route->incidents->map(fn (Incident $incident): array => $this->serializeAlert($incident))->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializePoiCard(PointOfInterest $poi, ?float $distanceMeters, ?CyclingRoute $route): array
    {
        $pivot = $route === null ? null : $this->poiPivotForRoute($poi, $route);
        $meta = array_values(array_filter([
            $poi->category?->name,
            $pivot instanceof Pivot && $pivot->getAttribute('distance_from_start_km') !== null
                ? 'Km '.number_format((float) $pivot->getAttribute('distance_from_start_km'), 1)
                : null,
            $poi->phone ? 'Tel. '.$poi->phone : null,
        ]));

        return [
            'type' => 'poi',
            'id' => $poi->id,
            'title' => $poi->name,
            'subtitle' => $poi->category?->name,
            'description' => $distanceMeters === null
                ? Str::limit((string) ($poi->description ?: $poi->observations ?: $poi->address), 160)
                : 'A '.number_format($distanceMeters / 1000, 2).' km de tu ubicación.',
            'href' => $route === null ? null : '/routes/'.$route->slug,
            'image_url' => $this->publicImageUrl($poi->images->first()?->image_path),
            'meta' => $meta,
            'distance_from_user_km' => $distanceMeters === null ? null : round($distanceMeters / 1000, 2),
            'latitude' => (float) $poi->latitude,
            'longitude' => (float) $poi->longitude,
            'address' => $poi->address,
            'phone' => $poi->phone,
            'route_context' => $pivot instanceof Pivot ? [
                'is_required' => (bool) $pivot->getAttribute('is_required'),
                'distance_from_start_km' => $pivot->getAttribute('distance_from_start_km') === null ? null : (float) $pivot->getAttribute('distance_from_start_km'),
                'observation' => $pivot->getAttribute('route_observation'),
            ] : null,
            'hours' => $poi->hours->take(7)->map(fn (PoiHour $hour): array => [
                'weekday' => $hour->weekday,
                'opens_at' => $this->formatTimeValue($hour->getAttribute('opens_at')),
                'closes_at' => $this->formatTimeValue($hour->getAttribute('closes_at')),
                'description' => $hour->description,
            ])->values()->all(),
            'details' => $this->poiDetails($poi),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array<string, mixed>>
     */
    private function searchPoiCards(array $payload, ?float $latitude, ?float $longitude, int $limit, ?CyclingRoute $route): array
    {
        return PointOfInterest::query()
            ->with([
                'category:id,name',
                'hours',
                'images',
                'foodDetail',
                'lodgingDetail',
                'storeDetail',
                'workshopDetail',
                'healthDetail',
            ])
            ->where('active', true)
            ->when($route !== null, fn (Builder $query) => $query->whereHas('routes', fn (Builder $routeQuery) => $routeQuery->whereKey($route->id)))
            ->when(isset($payload['category']), fn (Builder $query) => $query->whereHas('category', fn (Builder $categoryQuery) => $categoryQuery->where('name', 'like', '%'.$payload['category'].'%')))
            ->when(isset($payload['query']), fn (Builder $query) => $query->where(function (Builder $textQuery) use ($payload): void {
                $textQuery->where('name', 'like', '%'.$payload['query'].'%')
                    ->orWhere('description', 'like', '%'.$payload['query'].'%')
                    ->orWhere('observations', 'like', '%'.$payload['query'].'%')
                    ->orWhere('address', 'like', '%'.$payload['query'].'%');
            }))
            ->get()
            ->map(function (PointOfInterest $poi) use ($latitude, $longitude, $route): array {
                $distanceMeters = $latitude !== null && $longitude !== null
                    ? $this->haversineMeters($latitude, $longitude, (float) $poi->latitude, (float) $poi->longitude)
                    : null;

                return [
                    ...$this->serializePoiCard($poi, $distanceMeters, $route),
                    '_sort_distance_m' => $distanceMeters,
                ];
            })
            ->sortBy(fn (array $poi): float|int => $poi['_sort_distance_m'] ?? $poi['id'])
            ->take($limit)
            ->map(function (array $poi): array {
                unset($poi['_sort_distance_m']);

                return $poi;
            })
            ->values()
            ->all();
    }

    private function poiPivotForRoute(PointOfInterest $poi, CyclingRoute $route): ?Pivot
    {
        $loadedRoutePoi = $route->pointsOfInterest->firstWhere('id', $poi->id);
        $pivot = $loadedRoutePoi?->getRelationValue('pivot');

        return $pivot instanceof Pivot ? $pivot : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function poiDetails(PointOfInterest $poi): array
    {
        return [
            'food' => $poi->foodDetail === null ? null : [
                'has_wifi' => (bool) $poi->foodDetail->has_wifi,
                'has_bike_parking' => (bool) $poi->foodDetail->has_bike_parking,
                'chef_recommendation' => $poi->foodDetail->chef_recommendation,
            ],
            'store' => $poi->storeDetail === null ? null : [
                'sells_hydration' => (bool) $poi->storeDetail->sells_hydration,
                'sells_snacks' => (bool) $poi->storeDetail->sells_snacks,
                'accepted_payment_type' => $poi->storeDetail->accepted_payment_type,
            ],
            'workshop' => $poi->workshopDetail === null ? null : [
                'emergency_service' => (bool) $poi->workshopDetail->emergency_service,
                'emergency_phone' => $poi->workshopDetail->emergency_phone,
            ],
            'lodging' => $poi->lodgingDetail === null ? null : [
                'allows_bikes_in_room' => (bool) $poi->lodgingDetail->allows_bikes_in_room,
                'has_bike_wash_area' => (bool) $poi->lodgingDetail->has_bike_wash_area,
                'base_price' => $poi->lodgingDetail->base_price === null ? null : (float) $poi->lodgingDetail->base_price,
            ],
            'health' => $poi->healthDetail === null ? null : [
                'has_defibrillator' => (bool) $poi->healthDetail->has_defibrillator,
                'care_level' => $poi->healthDetail->care_level,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeAlert(Incident $incident): array
    {
        $reportedAt = $incident->getAttribute('reported_at');

        return [
            'type' => 'alert',
            'id' => $incident->id,
            'title' => $incident->title,
            'subtitle' => $incident->type?->name,
            'description' => Str::limit($incident->description, 180),
            'latitude' => (float) $incident->latitude,
            'longitude' => (float) $incident->longitude,
            'reported_at' => $reportedAt instanceof DateTimeInterface ? $reportedAt->format(DATE_ATOM) : null,
        ];
    }

    private function publicImageUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return URL::to(Storage::url($path));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{0: float|null, 1: float|null}
     */
    private function coordinatesFromPayload(array $payload): array
    {
        $location = $payload['location'] ?? null;

        if (is_array($location)) {
            return [
                $this->optionalFloat($location, 'latitude'),
                $this->optionalFloat($location, 'longitude'),
            ];
        }

        return [
            $this->optionalFloat($payload, 'latitude'),
            $this->optionalFloat($payload, 'longitude'),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function optionalFloat(array $payload, string $key): ?float
    {
        return array_key_exists($key, $payload) && $payload[$key] !== null && $payload[$key] !== ''
            ? (float) $payload[$key]
            : null;
    }

    private function distanceFromUserToRouteMeters(CyclingRoute $route, float $latitude, float $longitude): float
    {
        $line = $this->routeLineCoordinates($route);

        if ($line !== []) {
            return $this->progressOnLine($line, $latitude, $longitude, null)['nearest_point_distance_m'];
        }

        return min(
            $this->haversineMeters($latitude, $longitude, (float) $route->start_latitude, (float) $route->start_longitude),
            $this->haversineMeters($latitude, $longitude, (float) $route->end_latitude, (float) $route->end_longitude),
        );
    }

    /**
     * @return list<array{lat: float, lng: float}>
     */
    private function routeLineCoordinates(CyclingRoute $route): array
    {
        $geojson = $route->geometry?->getAttribute('geojson');

        if (! is_array($geojson) || ($geojson['type'] ?? null) !== 'LineString' || ! is_array($geojson['coordinates'] ?? null)) {
            return [];
        }

        $coordinates = [];

        foreach ($geojson['coordinates'] as $coordinate) {
            if (! is_array($coordinate) || count($coordinate) < 2 || ! is_numeric($coordinate[0]) || ! is_numeric($coordinate[1])) {
                continue;
            }

            $coordinates[] = [
                'lat' => (float) $coordinate[1],
                'lng' => (float) $coordinate[0],
            ];
        }

        return count($coordinates) >= 2 ? $coordinates : [];
    }

    /**
     * @param  list<array{lat: float, lng: float}>  $line
     * @return array{nearest_point_distance_m: float, progress_percentage: float, remaining_distance_km: float}
     */
    private function progressOnLine(array $line, float $latitude, float $longitude, ?float $officialDistanceKm): array
    {
        $segments = [];
        $totalMeters = 0.0;

        for ($index = 0; $index < count($line) - 1; $index++) {
            $length = $this->haversineMeters($line[$index]['lat'], $line[$index]['lng'], $line[$index + 1]['lat'], $line[$index + 1]['lng']);
            $segments[] = [
                'start' => $line[$index],
                'end' => $line[$index + 1],
                'length_m' => $length,
                'distance_before_m' => $totalMeters,
            ];
            $totalMeters += $length;
        }

        $best = [
            'distance_m' => INF,
            'distance_along_m' => 0.0,
        ];

        foreach ($segments as $segment) {
            $projection = $this->projectPointToSegment($latitude, $longitude, $segment['start']['lat'], $segment['start']['lng'], $segment['end']['lat'], $segment['end']['lng']);

            if ($projection['distance_m'] < $best['distance_m']) {
                $best = [
                    'distance_m' => $projection['distance_m'],
                    'distance_along_m' => $segment['distance_before_m'] + ($segment['length_m'] * $projection['t']),
                ];
            }
        }

        $progressRatio = $totalMeters > 0 ? max(0.0, min(1.0, $best['distance_along_m'] / $totalMeters)) : 0.0;
        $totalForRemainingKm = $officialDistanceKm ?? ($totalMeters / 1000);

        return [
            'nearest_point_distance_m' => $best['distance_m'],
            'progress_percentage' => $progressRatio * 100,
            'remaining_distance_km' => $totalForRemainingKm * (1 - $progressRatio),
        ];
    }

    /**
     * @return array{distance_m: float, t: float}
     */
    private function projectPointToSegment(float $pointLat, float $pointLng, float $startLat, float $startLng, float $endLat, float $endLng): array
    {
        $earthRadiusMeters = 6371000;
        $originLatRad = deg2rad($pointLat);
        $x1 = deg2rad($startLng - $pointLng) * cos($originLatRad) * $earthRadiusMeters;
        $y1 = deg2rad($startLat - $pointLat) * $earthRadiusMeters;
        $x2 = deg2rad($endLng - $pointLng) * cos($originLatRad) * $earthRadiusMeters;
        $y2 = deg2rad($endLat - $pointLat) * $earthRadiusMeters;
        $dx = $x2 - $x1;
        $dy = $y2 - $y1;
        $lengthSquared = ($dx * $dx) + ($dy * $dy);
        $t = $lengthSquared > 0 ? max(0.0, min(1.0, -(($x1 * $dx) + ($y1 * $dy)) / $lengthSquared)) : 0.0;
        $projectionX = $x1 + ($t * $dx);
        $projectionY = $y1 + ($t * $dy);

        return [
            'distance_m' => sqrt(($projectionX * $projectionX) + ($projectionY * $projectionY)),
            't' => $t,
        ];
    }

    private function haversineMeters(float $fromLatitude, float $fromLongitude, float $toLatitude, float $toLongitude): float
    {
        $earthRadiusMeters = 6371000;
        $latitudeDelta = deg2rad($toLatitude - $fromLatitude);
        $longitudeDelta = deg2rad($toLongitude - $fromLongitude);
        $fromLat = deg2rad($fromLatitude);
        $toLat = deg2rad($toLatitude);
        $a = sin($latitudeDelta / 2) ** 2 + cos($fromLat) * cos($toLat) * sin($longitudeDelta / 2) ** 2;

        return $earthRadiusMeters * 2 * atan2(sqrt($a), sqrt(1 - $a));
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
}
