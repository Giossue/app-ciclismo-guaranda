<?php

namespace App\Http\Requests\Cyclist;

use App\Models\CyclingRoute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreChatMessageRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('route_id') === 'none' || $this->input('route_id') === '') {
            $this->merge(['route_id' => null]);
        }

        if ($this->input('conversation_id') === '') {
            $this->merge(['conversation_id' => null]);
        }

        $location = $this->input('location');

        if (is_array($location)) {
            $latitude = $location['latitude'] ?? null;
            $longitude = $location['longitude'] ?? null;

            if (($latitude === null || $latitude === '') && ($longitude === null || $longitude === '')) {
                $this->merge(['location' => null]);
            }
        }
    }

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
            'message' => ['required', 'string', 'min:2', 'max:2000'],
            'route_id' => ['nullable', 'integer', Rule::exists(CyclingRoute::class, 'id')],
            'conversation_id' => ['nullable', 'integer', Rule::exists('conversaciones_ia', 'id')],
            'location' => ['nullable', 'array'],
            'location.latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:location.longitude'],
            'location.longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:location.latitude'],
            'location.accuracy_m' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'location.recorded_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $routeId = $this->input('route_id');

            if ($routeId === null || $routeId === '') {
                return;
            }

            $active = CyclingRoute::query()
                ->whereKey((int) $routeId)
                ->whereHas('status', fn ($query) => $query->where('name', 'activa'))
                ->exists();

            if (! $active) {
                $validator->errors()->add('route_id', 'La ruta de contexto debe estar activa.');
            }
        });
    }
}
