<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LodgingDetail extends Model
{
    protected $primaryKey = 'point_of_interest_id';

    public $incrementing = false;

    protected $table = 'detalles_hospedaje';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * @return BelongsTo<LodgingType, $this>
     */
    public function lodgingType(): BelongsTo
    {
        return $this->belongsTo(LodgingType::class, 'lodging_type_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allows_bikes_in_room' => 'boolean',
            'has_bike_wash_area' => 'boolean',
            'base_price' => 'decimal:2',
        ];
    }
}
