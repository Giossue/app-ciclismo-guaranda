<?php

namespace App\Http\Requests\Cyclist;

use App\Models\CyclingRoute;
use App\Models\Track;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTrackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Track::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
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
        });
    }
}
