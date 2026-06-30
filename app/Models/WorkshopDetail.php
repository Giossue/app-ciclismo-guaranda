<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WorkshopDetail extends Model
{
    protected $primaryKey = 'point_of_interest_id';

    public $incrementing = false;

    protected $table = 'detalles_taller';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<PointOfInterest, $this>
     */
    public function pointOfInterest(): BelongsTo
    {
        return $this->belongsTo(PointOfInterest::class, 'point_of_interest_id');
    }

    /**
     * @return BelongsTo<WorkshopSpecialty, $this>
     */
    public function specialty(): BelongsTo
    {
        return $this->belongsTo(WorkshopSpecialty::class, 'workshop_specialty_id');
    }

    /**
     * @return BelongsToMany<WorkshopService, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(WorkshopService::class, 'detalle_taller_servicio', 'point_of_interest_id', 'workshop_service_id')
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
            'emergency_service' => 'boolean',
        ];
    }
}
