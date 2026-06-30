<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodDetail extends Model
{
    protected $primaryKey = 'point_of_interest_id';

    public $incrementing = false;

    protected $table = 'detalles_comida';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * @return BelongsTo<CuisineType, $this>
     */
    public function cuisineType(): BelongsTo
    {
        return $this->belongsTo(CuisineType::class, 'cuisine_type_id');
    }

    /**
     * @return BelongsTo<PriceRange, $this>
     */
    public function priceRange(): BelongsTo
    {
        return $this->belongsTo(PriceRange::class, 'price_range_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_pet_friendly' => 'boolean',
            'has_wifi' => 'boolean',
            'has_bike_parking' => 'boolean',
        ];
    }
}
