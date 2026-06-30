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
        Schema::create('roles_usuario', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('generos', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained('roles_usuario')->nullOnDelete();
            $table->foreignId('gender_id')->nullable()->constrained('generos')->nullOnDelete();
            $table->string('last_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->softDeletes();
        });

        Schema::create('consentimientos_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('usuarios')->cascadeOnDelete();
            $table->string('type');
            $table->boolean('accepted')->default(false);
            $table->timestamp('accepted_at')->nullable();
            $table->string('document_version')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
        });

        Schema::create('auditorias_admin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->string('module');
            $table->string('action');
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->jsonb('previous_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->timestamp('action_at')->useCurrent();
            $table->timestamps();

            $table->index(['module', 'action']);
            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditorias_admin');
        Schema::dropIfExists('consentimientos_usuario');

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropConstrainedForeignId('gender_id');
            $table->dropColumn(['last_name', 'birth_date', 'active']);
            $table->dropSoftDeletes();
        });

        Schema::dropIfExists('generos');
        Schema::dropIfExists('roles_usuario');
    }
};
