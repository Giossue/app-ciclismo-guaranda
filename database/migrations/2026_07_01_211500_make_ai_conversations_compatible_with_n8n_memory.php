<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE conversaciones_ia ALTER COLUMN user_id DROP NOT NULL');
            DB::statement('ALTER TABLE conversaciones_ia ADD COLUMN IF NOT EXISTS session_id varchar(255)');
            DB::statement('ALTER TABLE conversaciones_ia ADD COLUMN IF NOT EXISTS message jsonb');
            DB::statement('CREATE INDEX IF NOT EXISTS conversaciones_ia_session_id_index ON conversaciones_ia (session_id)');
            Schema::dropIfExists('n8n_chat_histories');

            return;
        }

        Schema::table('conversaciones_ia', function (Blueprint $table) {
            if (! Schema::hasColumn('conversaciones_ia', 'session_id')) {
                $table->string('session_id')->nullable()->index();
            }

            if (! Schema::hasColumn('conversaciones_ia', 'message')) {
                $table->json('message')->nullable();
            }
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE TABLE IF NOT EXISTS n8n_chat_histories (id serial PRIMARY KEY, session_id varchar(255) NOT NULL, message jsonb NOT NULL)');
            DB::statement('CREATE INDEX IF NOT EXISTS n8n_chat_histories_session_id_idx ON n8n_chat_histories (session_id)');
            DB::statement('DROP INDEX IF EXISTS conversaciones_ia_session_id_index');
            DB::statement('DELETE FROM conversaciones_ia WHERE user_id IS NULL');
            DB::statement('ALTER TABLE conversaciones_ia DROP COLUMN IF EXISTS message');
            DB::statement('ALTER TABLE conversaciones_ia DROP COLUMN IF EXISTS session_id');
            DB::statement('ALTER TABLE conversaciones_ia ALTER COLUMN user_id SET NOT NULL');

            return;
        }

        Schema::table('conversaciones_ia', function (Blueprint $table) {
            if (Schema::hasColumn('conversaciones_ia', 'session_id')) {
                $table->dropIndex(['session_id']);
                $table->dropColumn('session_id');
            }

            if (Schema::hasColumn('conversaciones_ia', 'message')) {
                $table->dropColumn('message');
            }
        });
    }
};
