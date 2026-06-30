<?php

namespace App\Http\Requests\Cyclist;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRouteDownloadRequest extends FormRequest
{
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
            'download_status' => ['nullable', 'string', 'in:iniciada,completada,error,eliminada'],
            'size_mb' => ['nullable', 'numeric', 'min:0', 'max:50000'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Los datos de descarga offline no son válidos.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
