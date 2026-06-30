<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteView extends Model
{
    protected $table = 'consultas_ruta';

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'viewed_at' => 'datetime',
        ];
    }
}
