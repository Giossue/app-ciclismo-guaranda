<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncidentStatus extends Model
{
    protected $table = 'estados_incidencia';

    protected $guarded = ['id'];
}
