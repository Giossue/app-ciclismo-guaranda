<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversaciones_ia', function (Blueprint $table) {
            if (! Schema::hasColumn('conversaciones_ia', 'session_id')) {
                $table->string('session_id')->nullable()->after('user_id')->index();
            }
        });

        Schema::table('mensajes_ia', function (Blueprint $table) {
            if (! Schema::hasColumn('mensajes_ia', 'session_id')) {
                $table->string('session_id')->nullable()->after('ai_conversation_id')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('mensajes_ia', function (Blueprint $table) {
            if (Schema::hasColumn('mensajes_ia', 'session_id')) {
                $table->dropIndex(['session_id']);
                $table->dropColumn('session_id');
            }
        });

        Schema::table('conversaciones_ia', function (Blueprint $table) {
            if (Schema::hasColumn('conversaciones_ia', 'session_id')) {
                $table->dropIndex(['session_id']);
                $table->dropColumn('session_id');
            }
        });
    }
};
