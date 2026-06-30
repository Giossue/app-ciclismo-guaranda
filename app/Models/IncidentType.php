<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncidentType extends Model
{
    protected $table = 'tipos_incidencia';

    protected $guarded = ['id'];
}
