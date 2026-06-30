<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InitialAdminUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = config('guaranda.initial_admin.email');
        $password = config('guaranda.initial_admin.password');

        if (! is_string($email) || $email === '' || ! is_string($password) || $password === '') {
            return;
        }

        $name = config('guaranda.initial_admin.name');
        $adminRole = UserRole::query()->where('name', 'administrador')->first();

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'role_id' => $adminRole?->id,
                'name' => is_string($name) && $name !== '' ? $name : 'Administrador Guaranda Go',
                'password' => $password,
                'active' => true,
            ],
        );
    }
}
