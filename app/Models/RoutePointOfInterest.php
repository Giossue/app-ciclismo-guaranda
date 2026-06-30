<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutePointOfInterest extends Model
{
    protected $table = 'ruta_punto_interes';

    public $incrementing = false;

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_required' => 'boolean',
            'distance_from_start_km' => 'decimal:3',
        ];
    }
}
