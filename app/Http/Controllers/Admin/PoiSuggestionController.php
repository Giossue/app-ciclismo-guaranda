<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListPoiFeedbackRequest;
use App\Models\PoiSuggestion;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class PoiSuggestionController extends Controller
{
    /**
     * Display the suggestions submitted by cyclists.
     */
    public function __invoke(ListPoiFeedbackRequest $request): Response
    {
        $this->authorize('viewAny', PoiSuggestion::class);

        $filters = $request->validated();
        $search = $filters['search'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);

        $suggestions = PoiSuggestion::query()
            ->select([
                'id',
                'user_id',
                'poi_category_id',
                'name',
                'description',
                'status',
                'suggested_at',
            ])
            ->with(['category:id,name', 'user:id,name,last_name'])
            ->when($search, function (Builder $query, string $search): void {
                $pattern = "%{$search}%";

                $query->where(function (Builder $query) use ($pattern): void {
                    $query
                        ->whereLike('name', $pattern)
                        ->orWhereLike('description', $pattern)
                        ->orWhereHas('category', fn (Builder $categoryQuery) => $categoryQuery->whereLike('name', $pattern))
                        ->orWhereHas('user', function (Builder $userQuery) use ($pattern): void {
                            $userQuery
                                ->whereLike('name', $pattern)
                                ->orWhereLike('last_name', $pattern);
                        });
                });
            })
            ->latest('suggested_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (PoiSuggestion $suggestion): array => $this->serializeSuggestion($suggestion));

        return Inertia::render('admin/pois/suggestions/index', [
            'suggestions' => $suggestions,
            'filters' => [
                'search' => $search ?? '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSuggestion(PoiSuggestion $suggestion): array
    {
        $suggestedAt = $suggestion->getAttribute('suggested_at');

        return [
            'id' => $suggestion->id,
            'name' => $suggestion->name,
            'description' => $suggestion->description,
            'status' => $suggestion->status,
            'suggested_at' => $suggestedAt instanceof DateTimeInterface ? $suggestedAt->format(DATE_ATOM) : null,
            'category' => $suggestion->category === null ? null : [
                'id' => $suggestion->category->id,
                'name' => $suggestion->category->name,
            ],
            'user' => $suggestion->user === null ? null : trim("{$suggestion->user->name} {$suggestion->user->last_name}"),
        ];
    }
}
