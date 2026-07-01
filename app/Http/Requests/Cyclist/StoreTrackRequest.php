<?php

namespace App\Http\Requests\Cyclist;

use App\Models\CyclingRoute;
use App\Models\Track;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTrackRequest extends FormRequest
{
    private const START_DISTANCE_THRESHOLD_METERS = 150;

    public function authorize(): bool
    {
        return $this->user()?->can('create', Track::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy_m' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $route = $this->route('route');

            if (! $route instanceof CyclingRoute) {
                return;
            }

            if ($route->status?->name !== 'activa') {
                $validator->errors()->add('route', 'Solo se puede iniciar un recorrido sobre una ruta activa.');
            }

            $hasActiveTrack = Track::query()
                ->where('user_id', $this->user()?->id)
                ->where('route_id', $route->id)
                ->whereHas('status', fn ($query) => $query->whereIn('name', ['en curso', 'pausado']))
                ->exists();

            if ($hasActiveTrack) {
                $validator->errors()->add('route', 'Ya tienes un recorrido activo o pausado para esta ruta.');
            }

            if ($this->filled(['latitude', 'longitude'])) {
                $distanceMeters = $this->distanceMeters(
                    (float) $this->input('latitude'),
                    (float) $this->input('longitude'),
                    (float) $route->start_latitude,
                    (float) $route->start_longitude,
                );

                if ($distanceMeters > self::START_DISTANCE_THRESHOLD_METERS) {
                    $validator->errors()->add(
                        'route',
                        'Debes acercarte al punto de partida para iniciar el recorrido. Distancia aproximada: '.round($distanceMeters).' m.',
                    );
                }
            }
        });
    }

    private function distanceMeters(float $fromLatitude, float $fromLongitude, float $toLatitude, float $toLongitude): float
    {
        $earthRadiusMeters = 6371000;
        $latitudeDelta = deg2rad($toLatitude - $fromLatitude);
        $longitudeDelta = deg2rad($toLongitude - $fromLongitude);
        $fromLatitude = deg2rad($fromLatitude);
        $toLatitude = deg2rad($toLatitude);

        $a = sin($latitudeDelta / 2) ** 2
            + cos($fromLatitude) * cos($toLatitude) * sin($longitudeDelta / 2) ** 2;

        return $earthRadiusMeters * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
