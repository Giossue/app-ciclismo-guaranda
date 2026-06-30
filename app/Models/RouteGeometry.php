<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteGeometry extends Model
{
    protected $table = 'geometrias_ruta';

    protected $guarded = ['id'];

    /**
     * @return BelongsTo<CyclingRoute, $this>
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(CyclingRoute::class, 'route_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'geojson' => 'array',
        ];
    }
}
