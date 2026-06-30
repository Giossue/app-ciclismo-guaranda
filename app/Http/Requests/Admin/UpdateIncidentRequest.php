<?php

namespace App\Http\Requests\Admin;

use App\Models\IncidentStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('incident')) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'incident_status_id' => ['required', 'integer', Rule::exists(IncidentStatus::class, 'id')],
            'admin_response' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
