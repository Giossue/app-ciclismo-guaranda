<?php

namespace App\Models;

use Laravel\Passkeys\Passkey;

class ClaveAcceso extends Passkey
{
    protected $table = 'claves_acceso';
}
