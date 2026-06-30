<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreDetail extends Model
{
    protected $primaryKey = 'point_of_interest_id';

    public $incrementing = false;

    protected $table = 'detalles_tienda';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * @return BelongsTo<StoreType, $this>
     */
    public function storeType(): BelongsTo
    {
        return $this->belongsTo(StoreType::class, 'store_type_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sells_hydration' => 'boolean',
            'sells_snacks' => 'boolean',
        ];
    }
}
