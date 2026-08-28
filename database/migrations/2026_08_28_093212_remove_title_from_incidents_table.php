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
        if (! Schema::hasColumn('incidencias', 'title')) {
            return;
        }

        DB::table('incidencias')
            ->select(['id', 'title', 'description'])
            ->orderBy('id')
            ->lazyById(200)
            ->each(function (object $incident): void {
                $title = trim((string) $incident->title);

                if ($title === '') {
                    return;
                }

                $description = trim((string) $incident->description);

                DB::table('incidencias')
                    ->where('id', $incident->id)
                    ->update([
                        'description' => $description === ''
                            ? $title
                            : "{$title}\n\n{$description}",
                    ]);
            });

        Schema::table('incidencias', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incidencias', function (Blueprint $table) {
            $table->string('title')->nullable();
        });
    }
};
