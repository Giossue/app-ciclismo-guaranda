<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rutas_favoritas_usuario', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->timestamp('favorited_at')->useCurrent();
            $table->timestamps();

            $table->primary(['user_id', 'route_id']);
        });

        Schema::create('estados_moderacion', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('valoraciones_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->foreignId('track_id')->nullable()->constrained('recorridos')->nullOnDelete();
            $table->foreignId('moderation_status_id')->constrained('estados_moderacion')->restrictOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->text('admin_response')->nullable();
            $table->timestamp('rated_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'route_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE valoraciones_ruta ADD CONSTRAINT valoraciones_ruta_rating_check CHECK (rating BETWEEN 1 AND 5)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valoraciones_ruta');
        Schema::dropIfExists('estados_moderacion');
        Schema::dropIfExists('rutas_favoritas_usuario');
    }
};
