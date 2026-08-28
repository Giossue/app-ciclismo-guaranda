<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\FavoriteRoute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $payload = $request->validate([
            'route' => ['nullable', 'string', 'max:160'],
        ]);

        $selectedRouteSlug = $payload['route'] ?? null;
        $routes = $this->activeRoutes()
            ->latest('id')
            ->limit(99)
            ->get();

        if ($selectedRouteSlug !== null && ! $routes->contains('slug', $selectedRouteSlug)) {
            $selectedRoute = $this->activeRoutes()
                ->where('slug', $selectedRouteSlug)
                ->first();

            if ($selectedRoute !== null) {
                $routes->push($selectedRoute);
            }
        }

        $routeIds = $routes->modelKeys();
        $favoriteRouteIds = FavoriteRoute::query()
            ->where('user_id', $request->user()?->id)
            ->whereIn('route_id', $routeIds)
            ->pluck('route_id')
            ->flip();
        if (! $routes->contains('slug', $selectedRouteSlug)) {
            $selectedRouteSlug = null;
        }

        return Inertia::render('maps/index', [
            'routes' => $routes
                ->map(fn (CyclingRoute $route): array => $this->serializeRoute(
                    $route,
                    $favoriteRouteIds->has($route->id),
                ))
                ->values(),
            'selectedRouteSlug' => $selectedRouteSlug,
        ]);
    }

    /**
     * @return Builder<CyclingRoute>
     */
    private function activeRoutes(): Builder
    {
        return CyclingRoute::query()
            ->select([
                'id',
                'route_category_id',
                'route_difficulty_id',
                'name',
                'slug',
                'start_name',
                'start_latitude',
                'start_longitude',
                'end_name',
                'end_latitude',
                'end_longitude',
                'main_image_path',
                'route_version',
            ])
            ->with([
                'category:id,name',
                'difficulty:id,name',
                'geometry:id,route_id,geojson',
                'metrics:id,route_id,route_version,distance_km,estimated_time_minutes',
                'pointsOfInterest' => fn (BelongsToMany $query) => $this->mapPointsOfInterest($query),
                'incidents' => fn (HasMany $query) => $this->mapIncidents($query),
            ])
            ->whereHas('status', fn (Builder $query) => $query->where('name', 'Activa'));
    }

    private function mapPointsOfInterest(BelongsToMany $query): BelongsToMany
    {
        $pointOfInterest = $query->getModel();

        return $query
            ->select([
                $pointOfInterest->qualifyColumn('id'),
                $pointOfInterest->qualifyColumn('poi_category_id'),
                $pointOfInterest->qualifyColumn('name'),
                $pointOfInterest->qualifyColumn('description'),
                $pointOfInterest->qualifyColumn('address'),
                $pointOfInterest->qualifyColumn('phone'),
                $pointOfInterest->qualifyColumn('latitude'),
                $pointOfInterest->qualifyColumn('longitude'),
            ])
            ->where('active', true)
            ->with([
                'category:id,name',
                'images:id,point_of_interest_id,image_path,description,sort_order',
            ]);
    }

    private function mapIncidents(HasMany $query): HasMany
    {
        return $query
            ->select([
                'id',
                'route_id',
                'incident_type_id',
                'latitude',
                'longitude',
            ])
            ->whereHas('status', fn (Builder $statusQuery) => $statusQuery->where('name', 'En revisión'))
            ->with('type:id,name');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRoute(CyclingRoute $route, bool $isFavorite): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'slug' => $route->slug,
            'start_name' => $route->start_name,
            'start_latitude' => (float) $route->start_latitude,
            'start_longitude' => (float) $route->start_longitude,
            'end_name' => $route->end_name,
            'end_latitude' => (float) $route->end_latitude,
            'end_longitude' => (float) $route->end_longitude,
            'main_image_path' => $route->main_image_path,
            'route_version' => $route->route_version,
            'geojson' => $route->geometry?->geojson,
            'category' => $route->category === null ? null : ['id' => $route->category->id, 'name' => $route->category->name],
            'difficulty' => $route->difficulty === null ? null : ['id' => $route->difficulty->id, 'name' => $route->difficulty->name],
            'metric' => $latestMetric === null ? null : [
                'distance_km' => (float) $latestMetric->distance_km,
                'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
            ],
            'points_of_interest' => $route->pointsOfInterest
                ->map(fn ($poi): array => [
                    'id' => $poi->id,
                    'name' => $poi->name,
                    'description' => $poi->description,
                    'address' => $poi->address,
                    'phone' => $poi->phone,
                    'latitude' => (float) $poi->latitude,
                    'longitude' => (float) $poi->longitude,
                    'category' => $poi->category === null ? null : ['id' => $poi->category->id, 'name' => $poi->category->name],
                    'images' => $poi->images->map(fn ($image): array => [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'description' => $image->description,
                    ])->values(),
                ])
                ->values(),
            'incidents' => $route->incidents
                ->map(fn ($incident): array => [
                    'id' => $incident->id,
                    'latitude' => (float) $incident->latitude,
                    'longitude' => (float) $incident->longitude,
                    'type' => $incident->type === null ? null : ['id' => $incident->type->id, 'name' => $incident->type->name],
                ])
                ->values(),
            'is_favorite' => $isFavorite,
        ];
    }
}
