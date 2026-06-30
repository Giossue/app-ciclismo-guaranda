<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkshopDetailService extends Model
{
    public $incrementing = false;

    protected $table = 'detalle_taller_servicio';

    protected $guarded = ['id'];
}
