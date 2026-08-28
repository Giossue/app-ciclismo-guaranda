<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Destino de la notificación: sin esto, tocarla no puede llevar a ningún
     * lado y el aviso se queda en texto.
     */
    public function up(): void
    {
        Schema::table('notificaciones_app', function (Blueprint $table): void {
            $table->string('link')->nullable()->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('notificaciones_app', function (Blueprint $table): void {
            $table->dropColumn('link');
        });
    }
};
