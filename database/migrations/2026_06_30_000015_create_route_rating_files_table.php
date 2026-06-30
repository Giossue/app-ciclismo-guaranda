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
        Schema::create('archivos_valoracion_ruta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_rating_id')->constrained('valoraciones_ruta')->cascadeOnDelete();
            $table->string('file_path', 2048);
            $table->string('file_type', 20);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedInteger('size_kb')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos_valoracion_ruta');
    }
};
