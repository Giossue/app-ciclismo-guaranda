<?php

namespace App\Http\Requests\Admin;

use App\Models\ModerationStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRouteRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('rating')) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'moderation_status_id' => ['required', 'integer', Rule::exists(ModerationStatus::class, 'id')],
            'admin_response' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
