<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property int|null $role_id
 * @property int|null $gender_id
 * @property string $name
 * @property string|null $last_name
 * @property Carbon|null $birth_date
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property bool $active
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['role_id', 'gender_id', 'name', 'last_name', 'birth_date', 'email', 'password', 'active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    protected $table = 'usuarios';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * @return BelongsTo<UserRole, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(UserRole::class, 'role_id');
    }

    /**
     * @return BelongsTo<Gender, $this>
     */
    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class);
    }

    /**
     * @return HasMany<UserConsent, $this>
     */
    public function consents(): HasMany
    {
        return $this->hasMany(UserConsent::class);
    }

    /**
     * @return HasMany<CyclingRoute, $this>
     */
    public function createdRoutes(): HasMany
    {
        return $this->hasMany(CyclingRoute::class, 'admin_user_id');
    }

    /**
     * @return HasMany<Track, $this>
     */
    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class);
    }

    /**
     * @return HasMany<Incident, $this>
     */
    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    /**
     * @return BelongsToMany<CyclingRoute, $this>
     */
    public function favoriteRoutes(): BelongsToMany
    {
        return $this->belongsToMany(CyclingRoute::class, 'rutas_favoritas_usuario', 'user_id', 'route_id')
            ->withPivot('favorited_at')
            ->withTimestamps();
    }

    /**
     * @return HasMany<FavoriteRoute, $this>
     */
    public function favoriteRouteRecords(): HasMany
    {
        return $this->hasMany(FavoriteRoute::class, 'user_id');
    }

    /**
     * @return HasMany<RouteRating, $this>
     */
    public function routeRatings(): HasMany
    {
        return $this->hasMany(RouteRating::class);
    }

    /**
     * @return HasMany<AiConversation, $this>
     */
    public function aiConversations(): HasMany
    {
        return $this->hasMany(AiConversation::class, 'user_id');
    }

    public function isAdministrator(): bool
    {
        return $this->role?->name === 'administrador';
    }

    public function isCyclist(): bool
    {
        return $this->role?->name === 'ciclista';
    }

    public function isActive(): bool
    {
        return $this->active && ! $this->trashed();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'active' => 'boolean',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
