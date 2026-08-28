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
        $driver = DB::getDriverName();

        Schema::create('documentos_conocimiento_ia', function (Blueprint $table) use ($driver) {
            $table->id();
            $table->string('document_key', 191)->unique();
            $table->string('source_type', 24);
            $table->unsignedBigInteger('source_id');
            $table->string('section', 32);
            $table->char('language', 2)->default('es');
            $table->text('content');
            $table->char('checksum', 64);
            $driver === 'pgsql' ? $table->jsonb('metadata') : $table->json('metadata');
            $table->string('embedding_model', 100)->nullable();
            $table->timestampTz('embedded_at')->nullable();
            $table->timestamps();

            // SQLite is kept for the regular test suite. PostgreSQL receives
            // the native pgvector column just below.
            if ($driver !== 'pgsql') {
                $table->json('embedding')->nullable();
            }

            $table->index(['source_type', 'source_id']);
            $table->index(['embedding_model', 'embedded_at']);
        });

        if ($driver !== 'pgsql') {
            return;
        }

        $vectorInstalled = DB::table('pg_extension')
            ->where('extname', 'vector')
            ->exists();

        if (! $vectorInstalled) {
            throw new RuntimeException('La extensión pgvector debe estar instalada antes de migrar documentos de conocimiento.');
        }

        DB::statement('ALTER TABLE documentos_conocimiento_ia ADD COLUMN embedding halfvec(3072) NULL');
        DB::statement('CREATE INDEX documentos_conocimiento_ia_embedding_hnsw ON documentos_conocimiento_ia USING hnsw (embedding halfvec_cosine_ops) WHERE embedding IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS documentos_conocimiento_ia_embedding_hnsw');
        }

        Schema::dropIfExists('documentos_conocimiento_ia');
    }
};
