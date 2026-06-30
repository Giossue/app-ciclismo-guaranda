<?php

namespace App\Http\Requests\Cyclist;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SyncOfflineEventsRequest extends FormRequest
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
            'events' => ['required', 'array', 'min:1', 'max:50'],
            'events.*.client_id' => ['required', 'string', 'max:255'],
            'events.*.event_type' => ['required', 'string', Rule::in(['offline_incident_reported', 'offline_track_completed'])],
            'events.*.payload' => ['required', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('events', []) as $index => $event) {
                if (! is_array($event)) {
                    continue;
                }

                $payload = $event['payload'] ?? [];
                $eventType = $event['event_type'] ?? null;

                if (! is_array($payload)) {
                    continue;
                }

                if ($eventType === 'offline_incident_reported') {
                    foreach (['route_id', 'incident_type_id', 'title', 'description', 'latitude', 'longitude'] as $field) {
                        if (! array_key_exists($field, $payload) || $payload[$field] === null || $payload[$field] === '') {
                            $validator->errors()->add("events.{$index}.payload.{$field}", 'Campo requerido para incidencia offline.');
                        }
                    }
                }

                if ($eventType === 'offline_track_completed') {
                    foreach (['route_id', 'started_at', 'ended_at', 'points'] as $field) {
                        if (! array_key_exists($field, $payload) || $payload[$field] === null || $payload[$field] === '') {
                            $validator->errors()->add("events.{$index}.payload.{$field}", 'Campo requerido para recorrido offline.');
                        }
                    }

                    if (isset($payload['points']) && (! is_array($payload['points']) || count($payload['points']) < 2)) {
                        $validator->errors()->add("events.{$index}.payload.points", 'Un recorrido offline requiere al menos dos puntos GPS.');
                    }
                }
            }
        });
    }

    protected function failedValidation(ValidatorContract $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Los datos offline no son válidos.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
