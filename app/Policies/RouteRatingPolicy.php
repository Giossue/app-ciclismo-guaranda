<?php

namespace App\Policies;

use App\Models\RouteRating;
use App\Models\User;

class RouteRatingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdministrator();
    }

    public function view(User $user, RouteRating $routeRating): bool
    {
        return $user->isAdministrator() || $routeRating->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, RouteRating $routeRating): bool
    {
        return $user->isAdministrator() || $routeRating->user_id === $user->id;
    }

    public function delete(User $user, RouteRating $routeRating): bool
    {
        return $routeRating->user_id === $user->id;
    }

    public function restore(User $user, RouteRating $routeRating): bool
    {
        return $routeRating->user_id === $user->id;
    }

    public function forceDelete(User $user, RouteRating $routeRating): bool
    {
        return false;
    }
}
