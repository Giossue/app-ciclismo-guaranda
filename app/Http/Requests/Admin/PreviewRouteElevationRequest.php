<?php

namespace App\Http\Requests\Admin;

use App\Models\CyclingRoute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PreviewRouteElevationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! is_string($this->input('geojson'))) {
            return;
        }

        $decodedGeojson = json_decode($this->string('geojson')->toString(), true);

        if (json_last_error() === JSON_ERROR_NONE) {
            $this->merge(['geojson' => $decodedGeojson]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->can('create', CyclingRoute::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'geojson' => ['required', 'array'],
            'geojson.type' => ['required', 'string', 'in:LineString'],
            'geojson.coordinates' => ['required', 'array', 'min:2'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $coordinates = $this->input('geojson.coordinates');

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
