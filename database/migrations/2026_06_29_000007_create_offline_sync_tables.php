<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('formatos_exportacion', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('descargas_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->foreignId('export_format_id')->nullable()->constrained('formatos_exportacion')->nullOnDelete();
            $table->unsignedInteger('route_version');
            $table->string('download_status')->default('iniciada')->index();
            $table->decimal('size_mb', 10, 2)->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->timestamp('local_deleted_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'route_id']);
        });

        Schema::create('consultas_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('rutas')->cascadeOnDelete();
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamps();

            $table->index(['route_id', 'viewed_at']);
        });

        Schema::create('entradas_cola_sincronizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('event_type');
            $table->jsonb('payload');
            $table->string('status')->default('pendiente')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entradas_cola_sincronizacion');
        Schema::dropIfExists('consultas_ruta');
        Schema::dropIfExists('descargas_ruta');
        Schema::dropIfExists('formatos_exportacion');
    }
};
