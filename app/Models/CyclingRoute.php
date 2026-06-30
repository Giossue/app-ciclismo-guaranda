<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class CyclingRoute extends Model
{
    use SoftDeletes;

    protected $table = 'rutas';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    /**
     * @return BelongsTo<RouteDifficulty, $this>
     */
    public function difficulty(): BelongsTo
    {
        return $this->belongsTo(RouteDifficulty::class, 'route_difficulty_id');
    }

    /**
     * @return BelongsTo<RouteStatus, $this>
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(RouteStatus::class, 'route_status_id');
    }

    /**
     * @return BelongsTo<RouteCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RouteCategory::class, 'route_category_id');
    }

    /**
     * @return HasOne<RouteGeometry, $this>
     */
    public function geometry(): HasOne
    {
        return $this->hasOne(RouteGeometry::class, 'route_id');
    }

    /**
     * @return HasMany<RouteMetric, $this>
     */
    public function metrics(): HasMany
    {
        return $this->hasMany(RouteMetric::class, 'route_id');
    }

    /**
     * @return HasMany<RouteImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(RouteImage::class, 'route_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<RouteRecommendation, $this>
     */
    public function recommendations(): HasMany
    {
        return $this->hasMany(RouteRecommendation::class, 'route_id')->orderBy('id');
    }

    /**
     * @return HasMany<RouteObservation, $this>
     */
    public function observations(): HasMany
    {
        return $this->hasMany(RouteObservation::class, 'route_id')->orderBy('id');
    }

    /**
     * @return BelongsToMany<PointOfInterest, $this>
     */
    public function pointsOfInterest(): BelongsToMany
    {
        return $this->belongsToMany(PointOfInterest::class, 'ruta_punto_interes', 'route_id', 'point_of_interest_id')
            ->withPivot(['sort_order', 'is_required', 'distance_from_start_km', 'route_observation'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    /**
     * @return HasMany<Incident, $this>
     */
    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'route_id');
    }

    /**
     * @return HasMany<RouteRating, $this>
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(RouteRating::class, 'route_id');
    }

    /**
     * @return HasMany<Track, $this>
     */
    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class, 'route_id');
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'rutas_favoritas_usuario', 'route_id', 'user_id')
            ->withPivot('favorited_at')
            ->withTimestamps();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_latitude' => 'decimal:7',
            'start_longitude' => 'decimal:7',
            'end_latitude' => 'decimal:7',
            'end_longitude' => 'decimal:7',
            'route_version' => 'integer',
        ];
    }
}
