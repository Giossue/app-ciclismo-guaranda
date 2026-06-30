<?php

namespace App\Policies;

use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdministrator();
    }

    public function view(User $user, Incident $incident): bool
    {
        return $user->isAdministrator() || $incident->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, Incident $incident): bool
    {
        return $user->isAdministrator();
    }

    public function delete(User $user, Incident $incident): bool
    {
        return false;
    }

    public function restore(User $user, Incident $incident): bool
    {
        return false;
    }

    public function forceDelete(User $user, Incident $incident): bool
    {
        return false;
    }
}
