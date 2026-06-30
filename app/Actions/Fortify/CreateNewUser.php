<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $cyclistRole = UserRole::query()->firstOrCreate(
            ['name' => 'ciclista'],
            ['description' => 'Usuario que consulta rutas, registra recorridos, reporta incidencias y valora experiencias.'],
        );

        return User::create([
            'role_id' => $cyclistRole->id,
            'gender_id' => $input['gender_id'],
            'name' => $input['name'],
            'last_name' => $input['last_name'],
            'birth_date' => $input['birth_date'],
            'email' => $input['email'],
            'password' => $input['password'],
            'active' => true,
        ]);
    }
}
