<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesPoiPayload;
use App\Models\PointOfInterest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePoiRequest extends FormRequest
{
    use ValidatesPoiPayload;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', PointOfInterest::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->preparePoiPayloadForValidation();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->poiRules();
    }

    public function withValidator(Validator $validator): void
    {
        $this->withPoiPayloadValidator($validator);
    }
}
