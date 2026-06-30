<?php

namespace App\Http\Controllers\Cyclist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cyclist\StoreRouteRatingRequest;
use App\Models\CyclingRoute;
use App\Models\ModerationStatus;
use App\Models\RouteRating;
use App\Models\Track;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

class RouteRatingController extends Controller
{
    public function store(StoreRouteRatingRequest $request, CyclingRoute $route): RedirectResponse
    {
        abort_unless($route->status?->name === 'activa', 404);

        $this->authorize('create', RouteRating::class);

        $userId = $request->user()?->id;
        abort_if($userId === null, 403);

        $payload = $request->validated();
        $track = $this->latestValidTrack($route, $userId);
        $pending = ModerationStatus::query()->where('name', 'pendiente')->firstOrFail();

        /** @var RouteRating|null $rating */
        $rating = RouteRating::query()
            ->withTrashed()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->first();

        if ($rating === null) {
            $rating = new RouteRating([
                'user_id' => $userId,
                'route_id' => $route->id,
            ]);
        }

        $rating->forceFill([
            'track_id' => $track?->id,
            'moderation_status_id' => $pending->id,
            'rating' => (int) $payload['rating'],
            'comment' => $payload['comment'] ?? null,
            'admin_response' => null,
            'rated_at' => now(),
            'deleted_at' => null,
        ])->save();

        $this->storeMedia($request, $rating);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rating sent for moderation.')]);

        return back();
    }

    public function update(StoreRouteRatingRequest $request, RouteRating $rating): RedirectResponse
    {
        $this->authorize('update', $rating);

        $route = $rating->route;
        abort_if($route === null, 404);

        $userId = $request->user()?->id;
        abort_if($userId === null, 403);

        $payload = $request->validated();
        $track = $this->latestValidTrack($route, $userId);
        $pending = ModerationStatus::query()->where('name', 'pendiente')->firstOrFail();

        $rating->forceFill([
            'track_id' => $track?->id,
            'moderation_status_id' => $pending->id,
            'rating' => (int) $payload['rating'],
            'comment' => $payload['comment'] ?? null,
            'admin_response' => null,
            'rated_at' => now(),
        ])->save();

        $this->storeMedia($request, $rating);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rating updated and sent for moderation.')]);

        return back();
    }

    public function destroy(RouteRating $rating): RedirectResponse
    {
        $this->authorize('delete', $rating);

        $rating->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Rating deleted.')]);

        return back();
    }

    private function latestValidTrack(CyclingRoute $route, int $userId): ?Track
    {
        return Track::query()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->where('is_valid', true)
            ->whereHas('status', fn ($query) => $query->where('name', 'finalizado'))
            ->latest('ended_at')
            ->latest('id')
            ->first();
    }

    private function storeMedia(StoreRouteRatingRequest $request, RouteRating $rating): void
    {
        $media = $request->file('media');

        if ($media instanceof UploadedFile) {
            $media = [$media];
        }

        if ($media === null || $media === []) {
            return;
        }

        $nextSortOrder = (int) $rating->files()->max('sort_order') + 1;

        foreach ($media as $file) {
            $mimeType = $file->getMimeType();
            $rating->files()->create([
                'file_path' => $file->store('route-rating-media', 'public'),
                'file_type' => str_starts_with((string) $mimeType, 'video/') ? 'video' : 'image',
                'mime_type' => $mimeType,
                'size_kb' => (int) ceil($file->getSize() / 1024),
                'sort_order' => $nextSortOrder,
            ]);

            $nextSortOrder++;
        }
    }
}
