<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Models\CyclingRoute;
use App\Models\FavoriteRoute;
use App\Models\Incident;
use App\Models\IncidentType;
use App\Models\PoiCategory;
use App\Models\PoiHour;
use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteRating;
use App\Models\RouteView;
use App\Models\Track;
use App\Models\TrackGpsPoint;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RouteController extends Controller
{
    public function index(): Response
    {
        $selectedCategory = request()->integer('category') ?: null;
        $routes = $this->activeRouteQuery()
            ->when($selectedCategory !== null, fn ($query) => $query->where('route_category_id', $selectedCategory))
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($route): array => $this->serializeRoute($route, false));

        return Inertia::render('routes/index', [
            'routes' => $routes,
            'categories' => RouteCategory::query()->orderBy('id')->get(['id', 'name']),
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function show(CyclingRoute $route): Response
    {
        abort_unless($route->status?->name === 'activa', 404);

        RouteView::query()->create([
            'route_id' => $route->id,
            'user_id' => request()->user()?->id,
            'viewed_at' => now(),
        ]);

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
            'ratings' => fn ($query) => $query
                ->whereHas('moderationStatus', fn ($statusQuery) => $statusQuery->where('name', 'aprobado'))
                ->with(['user:id,name,last_name', 'moderationStatus:id,name', 'files'])
                ->latest('rated_at'),
        ]);

        $activeTrack = Track::query()
            ->with(['status:id,name', 'gpsPoints'])
            ->where('user_id', request()->user()?->id)
            ->where('route_id', $route->id)
            ->whereHas('status', fn ($query) => $query->whereIn('name', ['en curso', 'pausado']))
            ->latest('id')
            ->first();

        return Inertia::render('routes/show', [
            'route' => $this->serializeRoute($route, true),
            'poiCategories' => PoiCategory::query()->orderBy('id')->get(['id', 'name']),
            'incidentTypes' => IncidentType::query()->orderBy('id')->get(['id', 'name']),
            'activeTrack' => $this->serializeActiveTrack($activeTrack),
        ]);
    }

    /**
     * @return Builder<CyclingRoute>
     */
    private function activeRouteQuery(): Builder
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
                'pointsOfInterest' => fn ($query) => $query->where('active', true)->with('category:id,name'),
                'incidents' => fn ($query) => $query
                    ->whereHas('status', fn ($statusQuery) => $statusQuery->where('name', 'en revisión'))
                    ->with(['type:id,name', 'status:id,name', 'files'])
                    ->latest('reported_at'),
            ])
            ->whereHas('status', fn ($query) => $query->where('name', 'activa'));
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRoute(CyclingRoute $route, bool $fullDescription): array
    {
        $latestMetric = $route->metrics->sortByDesc('route_version')->first();

        return [
            'id' => $route->id,
            'name' => $route->name,
            'slug' => $route->slug,
            'description' => $fullDescription ? $route->description : Str::limit($route->description, 180),
            'start_name' => $route->start_name,
            'start_latitude' => (float) $route->start_latitude,
            'start_longitude' => (float) $route->start_longitude,
            'end_name' => $route->end_name,
            'end_latitude' => (float) $route->end_latitude,
            'end_longitude' => (float) $route->end_longitude,
            'road_type' => $route->road_type,
            'main_image_path' => $route->main_image_path,
            'route_version' => $route->route_version,
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
            'rating_summary' => $this->ratingSummary($route),
            'approved_ratings' => $fullDescription ? $this->approvedRatings($route) : [],
            'user_interaction' => $this->userInteraction($route),
        ];
    }

    /**
     * @return array{average_rating: float|null, approved_count: int}
     */
    private function ratingSummary(CyclingRoute $route): array
    {
        $approvedRatings = RouteRating::query()
            ->where('route_id', $route->id)
            ->whereHas('moderationStatus', fn ($query) => $query->where('name', 'aprobado'));

        $count = (clone $approvedRatings)->count();
        $average = $count > 0 ? round((float) (clone $approvedRatings)->avg('rating'), 2) : null;

        return [
            'average_rating' => $average,
            'approved_count' => $count,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function approvedRatings(CyclingRoute $route): array
    {
        return RouteRating::query()
            ->with(['user:id,name,last_name', 'moderationStatus:id,name', 'files'])
            ->where('route_id', $route->id)
            ->whereHas('moderationStatus', fn ($query) => $query->where('name', 'aprobado'))
            ->latest('rated_at')
            ->limit(20)
            ->get()
            ->map(fn (RouteRating $rating): array => $this->serializeRating($rating, false))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function userInteraction(CyclingRoute $route): array
    {
        $userId = request()->user()?->id;

        if ($userId === null) {
            return [
                'is_favorite' => false,
                'can_rate' => false,
                'valid_tracks_count' => 0,
                'rating' => null,
            ];
        }

        $validTracksCount = Track::query()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->where('is_valid', true)
            ->whereHas('status', fn ($query) => $query->where('name', 'finalizado'))
            ->count();

        $rating = RouteRating::query()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->with(['moderationStatus:id,name', 'files'])
            ->first();

        return [
            'is_favorite' => FavoriteRoute::query()
                ->where('user_id', $userId)
                ->where('route_id', $route->id)
                ->exists(),
            'can_rate' => $validTracksCount > 0,
            'valid_tracks_count' => $validTracksCount,
            'rating' => $rating === null ? null : $this->serializeRating($rating, true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRating(RouteRating $rating, bool $includePrivateFields): array
    {
        $ratedAt = $rating->getAttribute('rated_at');
        $base = [
            'id' => $rating->id,
            'rating' => $rating->rating,
            'comment' => $rating->comment,
            'rated_at' => $ratedAt instanceof DateTimeInterface ? $ratedAt->format(DATE_ATOM) : null,
            'user' => $rating->user === null ? null : [
                'id' => $rating->user->id,
                'name' => trim("{$rating->user->name} {$rating->user->last_name}"),
            ],
            'status' => $rating->moderationStatus === null ? null : [
                'id' => $rating->moderationStatus->id,
                'name' => $rating->moderationStatus->name,
            ],
            'files' => $rating->files->map(fn ($file): array => [
                'id' => $file->id,
                'file_path' => $file->file_path,
                'file_type' => $file->file_type,
                'mime_type' => $file->mime_type,
            ])->values()->all(),
        ];

        if ($includePrivateFields) {
            $base['admin_response'] = $rating->admin_response;
        }

        return $base;
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
            'is_required' => $pivot instanceof Pivot && (bool) $pivot->getAttribute('is_required'),
            'distance_from_start_km' => $pivot instanceof Pivot && $pivot->getAttribute('distance_from_start_km') !== null
                ? (float) $pivot->getAttribute('distance_from_start_km')
                : null,
            'route_observation' => $pivot instanceof Pivot ? $pivot->getAttribute('route_observation') : null,
            'hours' => $poi->hours->map(fn (PoiHour $hour): array => [
                'weekday' => $hour->weekday,
                'opens_at' => $this->formatTimeValue($hour->getAttribute('opens_at')),
                'closes_at' => $this->formatTimeValue($hour->getAttribute('closes_at')),
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
     * @return array<string, mixed>|null
     */
    private function serializeActiveTrack(?Track $track): ?array
    {
        if ($track === null) {
            return null;
        }

        $startedAt = $track->getAttribute('started_at');
        $endedAt = $track->getAttribute('ended_at');

        return [
            'id' => $track->id,
            'status' => $track->status === null ? null : ['id' => $track->status->id, 'name' => $track->status->name],
            'started_at' => $startedAt instanceof DateTimeInterface ? $startedAt->format(DATE_ATOM) : null,
            'ended_at' => $endedAt instanceof DateTimeInterface ? $endedAt->format(DATE_ATOM) : null,
            'distance_traveled_km' => (float) $track->distance_traveled_km,
            'total_time_seconds' => (int) $track->total_time_seconds,
            'completion_percentage' => (float) $track->completion_percentage,
            'is_valid' => (bool) $track->is_valid,
            'summary' => $track->summary ?? [],
            'gps_points_count' => $track->gpsPoints->count(),
            'points' => $track->gpsPoints
                ->sortBy('recorded_at')
                ->map(fn (TrackGpsPoint $point): array => $this->serializeTrackPoint($point))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTrackPoint(TrackGpsPoint $point): array
    {
        $recordedAt = $point->getAttribute('recorded_at');

        return [
            'id' => $point->id,
            'latitude' => (float) $point->latitude,
            'longitude' => (float) $point->longitude,
            'accuracy_m' => $point->accuracy_m === null ? null : (float) $point->accuracy_m,
            'recorded_at' => $recordedAt instanceof DateTimeInterface ? $recordedAt->format(DATE_ATOM) : null,
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
    private function serializeIncident(Incident $incident): array
    {
        $reportedAt = $incident->getAttribute('reported_at');

        return [
            'id' => $incident->id,
            'title' => $incident->title,
            'description' => Str::limit($incident->description, 140),
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
}
