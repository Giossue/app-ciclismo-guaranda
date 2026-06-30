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
        Schema::create('conversaciones_ia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->jsonb('context')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('mensajes_ia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_conversation_id')->constrained('conversaciones_ia')->cascadeOnDelete();
            $table->string('role');
            $table->text('message');
            $table->string('provider')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();

            $table->index(['ai_conversation_id', 'sent_at']);
        });

        Schema::create('notificaciones_app', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false)->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones_app');
        Schema::dropIfExists('mensajes_ia');
        Schema::dropIfExists('conversaciones_ia');
    }
};
