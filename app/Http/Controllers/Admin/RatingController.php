<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRouteRatingRequest;
use App\Models\AppNotification;
use App\Models\ModerationStatus;
use App\Models\RouteRating;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RatingController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', RouteRating::class);

        $ratings = RouteRating::query()
            ->with(['route:id,name,slug', 'user:id,name,last_name,email', 'track:id,is_valid,completion_percentage', 'moderationStatus:id,name'])
            ->latest('rated_at')
            ->paginate(12)
            ->through(fn (RouteRating $rating): array => $this->serializeRating($rating));

        return Inertia::render('admin/ratings/index', [
            'ratings' => $ratings,
            'statuses' => ModerationStatus::query()->orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateRouteRatingRequest $request, RouteRating $rating): RedirectResponse
    {
        $payload = $request->validated();
        /** @var ModerationStatus $status */
        $status = ModerationStatus::query()->findOrFail($payload['moderation_status_id']);

        $rating->forceFill([
            'moderation_status_id' => $status->id,
            'admin_response' => $payload['admin_response'] ?? null,
        ])->save();

        AppNotification::query()->create([
            'user_id' => $rating->user_id,
            'type' => 'rating_reviewed',
            'title' => 'Tu valoración fue revisada',
            'message' => "Tu valoración de {$rating->route?->name} cambió a estado {$status->name}.",
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Valoración actualizada.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeRating(RouteRating $rating): array
    {
        $ratedAt = $rating->getAttribute('rated_at');

        return [
            'id' => $rating->id,
            'rating' => $rating->rating,
            'comment' => Str::limit((string) $rating->comment, 180),
            'full_comment' => $rating->comment,
            'admin_response' => $rating->admin_response,
            'rated_at' => $ratedAt instanceof DateTimeInterface ? $ratedAt->format(DATE_ATOM) : null,
            'route' => $rating->route === null ? null : [
                'id' => $rating->route->id,
                'name' => $rating->route->name,
                'slug' => $rating->route->slug,
            ],
            'user' => $rating->user === null ? null : [
                'id' => $rating->user->id,
                'name' => trim("{$rating->user->name} {$rating->user->last_name}"),
                'email' => $rating->user->email,
            ],
            'track' => $rating->track === null ? null : [
                'id' => $rating->track->id,
                'is_valid' => $rating->track->is_valid,
                'completion_percentage' => (float) $rating->track->completion_percentage,
            ],
            'status' => $rating->moderationStatus === null ? null : [
                'id' => $rating->moderationStatus->id,
                'name' => $rating->moderationStatus->name,
            ],
        ];
    }
}
