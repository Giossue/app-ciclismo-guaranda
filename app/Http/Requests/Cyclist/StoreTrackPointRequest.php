<?php

namespace App\Http\Requests\Cyclist;

use App\Models\Track;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTrackPointRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('track')) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'elevation_m' => ['nullable', 'numeric', 'between:-500,9000'],
            'speed_kmh' => ['nullable', 'numeric', 'min:0', 'max:160'],
            'accuracy_m' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'recorded_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $track = $this->route('track');

            if (! $track instanceof Track) {
                return;
            }

            if ($track->status?->name !== 'en curso') {
                $validator->errors()->add('track', 'Solo se pueden registrar puntos en un recorrido en curso.');
            }
        });
    }
}
