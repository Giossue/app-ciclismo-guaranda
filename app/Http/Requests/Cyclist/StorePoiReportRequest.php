<?php

namespace App\Http\Requests\Cyclist;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePoiReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $poi = $this->route('poi');

        return $this->user() !== null && $this->user()->can('view', $poi);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'report_type' => ['required', 'string', Rule::in(['cerrado', 'datos incorrectos', 'otro'])],
            'description' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
