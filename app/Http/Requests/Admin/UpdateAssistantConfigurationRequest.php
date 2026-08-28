<?php

namespace App\Http\Requests\Admin;

use App\Services\Ai\AssistantConfiguration;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssistantConfigurationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdministrator() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'chat_model' => ['required', 'string', Rule::in(AssistantConfiguration::CHAT_MODELS)],
            'chat_reasoning_effort' => ['required', 'string', Rule::in(AssistantConfiguration::REASONING_EFFORTS)],
        ];
    }
}
