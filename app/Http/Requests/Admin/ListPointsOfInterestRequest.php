<?php

namespace App\Http\Requests\Admin;

use App\Models\PoiCategory;
use App\Models\PointOfInterest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListPointsOfInterestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', PointOfInterest::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'form' => ['nullable', Rule::in(['create', 'edit'])],
            'poi' => [
                'nullable',
                'required_if:form,edit',
                'prohibited_unless:form,edit',
                'integer',
                'min:1',
                Rule::exists(PointOfInterest::class, 'id'),
            ],
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'integer', Rule::exists(PoiCategory::class, 'id')],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50])],
        ];
    }
}
