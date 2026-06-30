<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesRoutePayload;
use App\Models\CyclingRoute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRouteRequest extends FormRequest
{
    use ValidatesRoutePayload;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', CyclingRoute::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->prepareRoutePayloadForValidation();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->routeRules();
    }

    public function withValidator(Validator $validator): void
    {
        $this->withRoutePayloadValidator($validator);
    }
}
