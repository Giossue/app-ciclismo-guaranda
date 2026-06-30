<?php

namespace App\Policies;

use App\Models\Track;
use App\Models\User;

class TrackPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdministrator();
    }

    public function view(User $user, Track $track): bool
    {
        return $user->isAdministrator() || $track->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, Track $track): bool
    {
        return $track->user_id === $user->id && $user->isActive();
    }

    public function delete(User $user, Track $track): bool
    {
        return false;
    }

    public function restore(User $user, Track $track): bool
    {
        return false;
    }

    public function forceDelete(User $user, Track $track): bool
    {
        return false;
    }
}
