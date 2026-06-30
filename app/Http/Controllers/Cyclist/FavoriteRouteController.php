<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\FavoriteRoute;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteRouteController extends Controller
{
    public function index(): Response
    {
        $favorites = FavoriteRoute::query()
            ->with(['route.status:id,name', 'route.category:id,name', 'route.difficulty:id,name', 'route.metrics.transportMode:id,name'])
            ->where('user_id', request()->user()?->id)
            ->latest('favorited_at')
            ->paginate(12)
            ->through(fn (FavoriteRoute $favorite): array => $this->serializeFavorite($favorite));

        return Inertia::render('favorites/index', [
            'favorites' => $favorites,
        ]);
    }

    public function store(CyclingRoute $route): RedirectResponse
    {
        abort_unless($route->status?->name === 'activa', 404);

        $userId = request()->user()?->id;
        abort_if($userId === null, 403);

        FavoriteRoute::query()->updateOrCreate(
            [
                'user_id' => $userId,
                'route_id' => $route->id,
            ],
            [
                'favorited_at' => now(),
            ]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruta agregada a favoritos.')]);

        return back();
    }

    public function destroy(CyclingRoute $route): RedirectResponse
    {
        $userId = request()->user()?->id;
        abort_if($userId === null, 403);

        FavoriteRoute::query()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruta quitada de favoritos.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeFavorite(FavoriteRoute $favorite): array
    {
        $favoritedAt = $favorite->getAttribute('favorited_at');
        $route = $favorite->route;
        $latestMetric = $route?->metrics->sortByDesc('route_version')->first();

        return [
            'route' => $route === null ? null : [
                'id' => $route->id,
                'name' => $route->name,
                'slug' => $route->slug,
                'description' => Str::limit($route->description, 180),
                'start_name' => $route->start_name,
                'end_name' => $route->end_name,
                'route_version' => $route->route_version,
                'status' => $route->status === null ? null : ['id' => $route->status->id, 'name' => $route->status->name],
                'category' => $route->category === null ? null : ['id' => $route->category->id, 'name' => $route->category->name],
                'difficulty' => $route->difficulty === null ? null : ['id' => $route->difficulty->id, 'name' => $route->difficulty->name],
                'metric' => $latestMetric === null ? null : [
                    'distance_km' => (float) $latestMetric->distance_km,
                    'estimated_time_minutes' => $latestMetric->estimated_time_minutes,
                    'transport_mode' => $latestMetric->transportMode?->name,
                ],
            ],
            'favorited_at' => $favoritedAt instanceof DateTimeInterface ? $favoritedAt->format(DATE_ATOM) : null,
        ];
    }
}
