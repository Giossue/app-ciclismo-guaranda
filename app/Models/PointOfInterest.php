<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class PointOfInterest extends Model
{
    use SoftDeletes;

    protected $table = 'puntos_interes';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PoiCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(PoiCategory::class, 'poi_category_id');
    }

    /**
     * @return BelongsToMany<CyclingRoute, $this>
     */
    public function routes(): BelongsToMany
    {
        return $this->belongsToMany(CyclingRoute::class, 'ruta_punto_interes', 'point_of_interest_id', 'route_id')
            ->withPivot(['sort_order', 'is_required', 'distance_from_start_km', 'route_observation'])
            ->withTimestamps();
    }

    /**
     * @return HasMany<PoiHour, $this>
     */
    public function hours(): HasMany
    {
        return $this->hasMany(PoiHour::class, 'point_of_interest_id')->orderBy('weekday');
    }

    /**
     * @return HasMany<PoiImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(PoiImage::class, 'point_of_interest_id')->orderBy('sort_order');
    }

    /**
     * @return HasMany<PoiReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(PoiReport::class, 'point_of_interest_id');
    }

    /**
     * @return HasOne<FoodDetail, $this>
     */
    public function foodDetail(): HasOne
    {
        return $this->hasOne(FoodDetail::class, 'point_of_interest_id');
    }

    /**
     * @return HasOne<LodgingDetail, $this>
     */
    public function lodgingDetail(): HasOne
    {
        return $this->hasOne(LodgingDetail::class, 'point_of_interest_id');
    }

    /**
     * @return HasOne<StoreDetail, $this>
     */
    public function storeDetail(): HasOne
    {
        return $this->hasOne(StoreDetail::class, 'point_of_interest_id');
    }

    /**
     * @return HasOne<WorkshopDetail, $this>
     */
    public function workshopDetail(): HasOne
    {
        return $this->hasOne(WorkshopDetail::class, 'point_of_interest_id');
    }

    /**
     * @return HasOne<HealthDetail, $this>
     */
    public function healthDetail(): HasOne
    {
        return $this->hasOne(HealthDetail::class, 'point_of_interest_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'active' => 'boolean',
        ];
    }
}
