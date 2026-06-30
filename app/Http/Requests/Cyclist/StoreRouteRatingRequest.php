<?php

namespace App\Http\Requests\Cyclist;

use App\Models\CyclingRoute;
use App\Models\RouteRating;
use App\Models\Track;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRouteRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isActive() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:5000'],
            'media' => ['nullable', 'array', 'max:4'],
            'media.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:20480'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $route = $this->resolvedRoute();
            $userId = $this->user()?->id;

            if (! $route instanceof CyclingRoute || $userId === null) {
                $validator->errors()->add('route', 'Ruta inválida.');

                return;
            }

            if (! $this->hasValidCompletedTrack($route, $userId)) {
                $validator->errors()->add('route', 'Solo puedes valorar una ruta con un recorrido válido finalizado.');
            }
        });
    }

    private function resolvedRoute(): ?CyclingRoute
    {
        $route = $this->route('route');

        if ($route instanceof CyclingRoute) {
            return $route;
        }

        $rating = $this->route('rating');

        if ($rating instanceof RouteRating) {
            return $rating->route;
        }

        return null;
    }

    private function hasValidCompletedTrack(CyclingRoute $route, int $userId): bool
    {
        return Track::query()
            ->where('user_id', $userId)
            ->where('route_id', $route->id)
            ->where('is_valid', true)
            ->whereHas('status', fn ($query) => $query->where('name', 'finalizado'))
            ->exists();
    }
}
