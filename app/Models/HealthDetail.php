<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthDetail extends Model
{
    protected $primaryKey = 'point_of_interest_id';

    public $incrementing = false;

    protected $table = 'detalles_salud';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * @return BelongsTo<HealthCenterType, $this>
     */
    public function healthCenterType(): BelongsTo
    {
        return $this->belongsTo(HealthCenterType::class, 'health_center_type_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'has_defibrillator' => 'boolean',
            'care_level' => 'integer',
        ];
    }
}
