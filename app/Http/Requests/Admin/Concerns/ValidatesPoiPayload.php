<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\CuisineType;
use App\Models\CyclingRoute;
use App\Models\HealthCenterType;
use App\Models\LodgingType;
use App\Models\PoiCategory;
use App\Models\PriceRange;
use App\Models\StoreType;
use App\Models\WorkshopService;
use App\Models\WorkshopSpecialty;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

trait ValidatesPoiPayload
{
    protected function preparePoiPayloadForValidation(): void
    {
        $booleanFields = [
            'active',
            'is_pet_friendly',
            'has_wifi',
            'has_bike_parking',
            'allows_bikes_in_room',
            'has_bike_wash_area',
            'sells_hydration',
            'sells_snacks',
            'emergency_service',
            'has_defibrillator',
        ];

        foreach ($booleanFields as $field) {
            $this->merge([$field => $this->boolean($field)]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function poiRules(): array
    {
        return [
            'poi_category_id' => ['required', 'integer', Rule::exists(PoiCategory::class, 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'observations' => ['nullable', 'string', 'max:10000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:10000'],
            'phone' => ['nullable', 'string', 'max:255'],
            'active' => ['boolean'],
            'hours_text' => ['nullable', 'string', 'max:10000'],
            'images_text' => ['nullable', 'string', 'max:10000'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'max:5120'],
            'route_links_text' => ['nullable', 'string', 'max:10000'],
            'cuisine_type_id' => ['nullable', 'integer', Rule::exists(CuisineType::class, 'id')],
            'price_range_id' => ['nullable', 'integer', Rule::exists(PriceRange::class, 'id')],
            'is_pet_friendly' => ['boolean'],
            'has_wifi' => ['boolean'],
            'accepted_payment_type' => ['nullable', 'string', 'max:255'],
            'has_bike_parking' => ['boolean'],
            'chef_recommendation' => ['nullable', 'string', 'max:10000'],
            'menu_url' => ['nullable', 'string', 'max:2048'],
            'lodging_type_id' => ['nullable', 'integer', Rule::exists(LodgingType::class, 'id')],
            'allows_bikes_in_room' => ['boolean'],
            'has_bike_wash_area' => ['boolean'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'store_type_id' => ['nullable', 'integer', Rule::exists(StoreType::class, 'id')],
            'sells_hydration' => ['boolean'],
            'sells_snacks' => ['boolean'],
            'workshop_specialty_id' => ['nullable', 'integer', Rule::exists(WorkshopSpecialty::class, 'id')],
            'emergency_service' => ['boolean'],
            'emergency_phone' => ['nullable', 'string', 'max:255'],
            'workshop_service_ids_text' => ['nullable', 'string', 'max:10000'],
            'health_center_type_id' => ['nullable', 'integer', Rule::exists(HealthCenterType::class, 'id')],
            'has_defibrillator' => ['boolean'],
            'care_level' => ['nullable', 'integer', 'between:1,4'],
        ];
    }

    protected function withPoiPayloadValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->splitLines($this->input('route_links_text')) as $lineNumber => $line) {
                [$routeId, $required, $distance] = array_pad(explode('|', $line, 4), 4, null);

                if (! is_numeric($routeId) || ! CyclingRoute::query()->whereKey((int) $routeId)->exists()) {
                    $validator->errors()->add('route_links_text', 'Cada asociación debe iniciar con un ID de ruta válido. Línea '.($lineNumber + 1).'.');
                }

                if ($required !== null && $required !== '' && ! in_array($required, ['0', '1', 'no', 'si', 'sí'], true)) {
                    $validator->errors()->add('route_links_text', 'El campo obligatorio de ruta debe ser 1/0 o sí/no. Línea '.($lineNumber + 1).'.');
                }

                if ($distance !== null && $distance !== '' && ! is_numeric($distance)) {
                    $validator->errors()->add('route_links_text', 'La distancia desde el inicio debe ser numérica. Línea '.($lineNumber + 1).'.');
                }
            }

            foreach ($this->splitLines($this->input('hours_text')) as $lineNumber => $line) {
                [$weekday, $opensAt, $closesAt] = array_pad(explode('|', $line, 4), 4, null);

                if (! is_numeric($weekday) || (int) $weekday < 1 || (int) $weekday > 7) {
                    $validator->errors()->add('hours_text', 'El día debe estar entre 1 y 7. Línea '.($lineNumber + 1).'.');
                }

                foreach (['apertura' => $opensAt, 'cierre' => $closesAt] as $label => $value) {
                    if ($value !== null && $value !== '' && ! preg_match('/^\d{2}:\d{2}$/', $value)) {
                        $validator->errors()->add('hours_text', "La hora de {$label} debe tener formato HH:MM. Línea ".($lineNumber + 1).'.');
                    }
                }
            }

            foreach ($this->splitLines($this->input('workshop_service_ids_text')) as $lineNumber => $line) {
                if (! is_numeric($line) || ! WorkshopService::query()->whereKey((int) $line)->exists()) {
                    $validator->errors()->add('workshop_service_ids_text', 'Cada servicio de taller debe ser un ID válido. Línea '.($lineNumber + 1).'.');
                }
            }
        });
    }

    /**
     * @return list<string>
     */
    protected function splitLines(mixed $text): array
    {
        if (! is_string($text)) {
            return [];
        }

        $lines = preg_split('/\R/u', trim($text)) ?: [];

        return array_values(array_filter(array_map('trim', $lines), fn (string $line): bool => $line !== ''));
    }
}
