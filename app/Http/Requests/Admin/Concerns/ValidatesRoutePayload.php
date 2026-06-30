<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\PointOfInterest;
use App\Models\RouteCategory;
use App\Models\RouteDifficulty;
use App\Models\RouteStatus;
use App\Models\RoutingEngine;
use App\Models\TransportMode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

trait ValidatesRoutePayload
{
    protected function prepareRoutePayloadForValidation(): void
    {
        if (! is_string($this->input('geojson'))) {
            return;
        }

        $decodedGeojson = json_decode($this->string('geojson')->toString(), true);

        if (json_last_error() === JSON_ERROR_NONE) {
            $this->merge(['geojson' => $decodedGeojson]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function routeRules(): array
    {
        return [
            'route_status_id' => ['required', 'integer', Rule::exists(RouteStatus::class, 'id')],
            'route_category_id' => ['required', 'integer', Rule::exists(RouteCategory::class, 'id')],
            'route_difficulty_id' => ['required', 'integer', Rule::exists(RouteDifficulty::class, 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'start_name' => ['required', 'string', 'max:255'],
            'start_latitude' => ['required', 'numeric', 'between:-90,90'],
            'start_longitude' => ['required', 'numeric', 'between:-180,180'],
            'end_name' => ['required', 'string', 'max:255'],
            'end_latitude' => ['required', 'numeric', 'between:-90,90'],
            'end_longitude' => ['required', 'numeric', 'between:-180,180'],
            'road_type' => ['required', 'string', 'max:255'],
            'required_experience' => ['required', 'string', 'max:10000'],
            'main_image_path' => ['nullable', 'string', 'max:2048', 'required_without:main_image'],
            'main_image' => ['nullable', 'image', 'max:5120'],
            'additional_images' => ['nullable', 'array', 'max:8'],
            'additional_images.*' => ['image', 'max:5120'],
            'geojson' => ['required', 'array'],
            'geojson.type' => ['required', 'string', 'in:LineString'],
            'geojson.coordinates' => ['required', 'array', 'min:2'],
            'transport_mode_id' => ['required', 'integer', Rule::exists(TransportMode::class, 'id')],
            'routing_engine_id' => ['nullable', 'integer', Rule::exists(RoutingEngine::class, 'id')],
            'distance_km' => ['required', 'numeric', 'min:0.001'],
            'estimated_time_minutes' => ['required', 'integer', 'min:1'],
            'positive_elevation_m' => ['required', 'numeric', 'min:0'],
            'negative_elevation_m' => ['required', 'numeric', 'min:0'],
            'recommendations_text' => ['required', 'string', 'max:10000'],
            'observations_text' => ['required', 'string', 'max:10000'],
            'additional_images_text' => ['nullable', 'string', 'max:10000'],
            'poi_ids' => ['nullable', 'array'],
            'poi_ids.*' => ['integer', Rule::exists(PointOfInterest::class, 'id')->where('active', true)],
        ];
    }

    protected function withRoutePayloadValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $geojson = $this->input('geojson');

            if (! is_array($geojson)) {
                return;
            }

            $coordinates = $geojson['coordinates'] ?? null;

            if (! is_array($coordinates)) {
                return;
            }

            foreach ($coordinates as $index => $coordinate) {
                if (! is_array($coordinate) || count($coordinate) < 2) {
                    $validator->errors()->add(
                        "geojson.coordinates.{$index}",
                        'Cada coordenada GeoJSON debe incluir longitud y latitud.'
                    );

                    continue;
                }

                $longitude = $coordinate[0];
                $latitude = $coordinate[1];

                if (! is_numeric($longitude) || ! is_numeric($latitude)) {
                    $validator->errors()->add(
                        "geojson.coordinates.{$index}",
                        'Las coordenadas GeoJSON deben ser numéricas.'
                    );

                    continue;
                }

                if ((float) $longitude < -180 || (float) $longitude > 180) {
                    $validator->errors()->add(
                        "geojson.coordinates.{$index}.0",
                        'La longitud debe estar entre -180 y 180.'
                    );
                }

                if ((float) $latitude < -90 || (float) $latitude > 90) {
                    $validator->errors()->add(
                        "geojson.coordinates.{$index}.1",
                        'La latitud debe estar entre -90 y 90.'
                    );
                }
            }
        });
    }
}
