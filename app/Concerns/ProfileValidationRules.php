<?php

namespace App\Concerns;

use App\Models\Gender;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'last_name' => $this->lastNameRules(),
            'gender_id' => $this->genderRules(),
            'birth_date' => $this->birthDateRules(),
            'email' => $this->emailRules($userId),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user last names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function lastNameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user genders.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function genderRules(): array
    {
        return ['required', 'integer', Rule::exists(Gender::class, 'id')];
    }

    /**
     * Get the validation rules used to validate user birth dates.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function birthDateRules(): array
    {
        return ['required', 'date', 'before_or_equal:'.now()->subYears(10)->toDateString()];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
