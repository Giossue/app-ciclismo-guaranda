<?php

namespace App\Http\Requests\Cyclist;

use App\Models\AiConversation;
use App\Models\CyclingRoute;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreChatMessageRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('route_id') === 'none' || $this->input('route_id') === '') {
            $this->merge(['route_id' => null]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->isActive() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:2', 'max:2000'],
            'conversation_id' => ['nullable', 'integer', Rule::exists(AiConversation::class, 'id')->where('user_id', $this->user()?->id)],
            'route_id' => ['nullable', 'integer', Rule::exists(CyclingRoute::class, 'id')],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $routeId = $this->input('route_id');

            if ($routeId === null || $routeId === '') {
                return;
            }

            $active = CyclingRoute::query()
                ->whereKey((int) $routeId)
                ->whereHas('status', fn ($query) => $query->where('name', 'activa'))
                ->exists();

            if (! $active) {
                $validator->errors()->add('route_id', 'La ruta de contexto debe estar activa.');
            }
        });
    }
}
