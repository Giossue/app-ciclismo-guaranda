<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoiCategory extends Model
{
    protected $table = 'categorias_poi';

    protected $guarded = ['id'];
}
