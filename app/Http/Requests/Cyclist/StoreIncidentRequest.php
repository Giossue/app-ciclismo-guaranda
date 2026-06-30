<?php

namespace App\Http\Requests\Cyclist;

use App\Models\CyclingRoute;
use App\Models\Incident;
use App\Models\IncidentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Incident::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'route_id' => ['required', 'integer', Rule::exists(CyclingRoute::class, 'id')],
            'incident_type_id' => ['required', 'integer', Rule::exists(IncidentType::class, 'id')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $routeId = $this->input('route_id');

            if (! is_numeric($routeId)) {
                return;
            }

            $isActiveRoute = CyclingRoute::query()
                ->whereKey((int) $routeId)
                ->whereHas('status', fn ($query) => $query->where('name', 'activa'))
                ->exists();

            if (! $isActiveRoute) {
                $validator->errors()->add('route_id', 'La incidencia debe asociarse a una ruta activa.');
            }
        });
    }
}
