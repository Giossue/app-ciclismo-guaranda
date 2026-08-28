<?php

namespace App\Http\Requests\Admin;

use App\Models\CyclingRoute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class PreviewRouteRoutingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', CyclingRoute::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'waypoints' => ['required', 'array', 'min:2', 'max:10'],
            'waypoints.*' => ['required', 'array:latitude,longitude'],
            'waypoints.*.latitude' => ['required', 'numeric', 'between:-90,90'],
            'waypoints.*.longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Revisa los puntos seleccionados para la ruta.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
