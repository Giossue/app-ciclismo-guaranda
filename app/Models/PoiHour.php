<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PoiHour extends Model
{
    protected $table = 'horarios_punto_interes';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weekday' => 'integer',
            'opens_at' => 'datetime:H:i:s',
            'closes_at' => 'datetime:H:i:s',
        ];
    }
}
