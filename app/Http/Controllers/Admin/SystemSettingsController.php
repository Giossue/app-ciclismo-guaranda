<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function __invoke(): Response
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/settings/index', [
            'settings' => [
                'application' => [
                    'name' => config('app.name'),
                    'environment' => config('app.env'),
                    'debug' => (bool) config('app.debug'),
                    'url' => config('app.url'),
                    'timezone' => config('app.timezone'),
                    'locale' => config('app.locale'),
                ],
                'drivers' => [
                    'database' => config('database.default'),
                    'session' => config('session.driver'),
                    'cache' => config('cache.default'),
                    'queue' => config('queue.default'),
                    'filesystem' => config('filesystems.default'),
                ],
                'integrations' => [
                    'n8n_webhook_configured' => filled(config('guaranda.n8n.webhook_url')),
                    'n8n_timeout_seconds' => config('guaranda.n8n.timeout_seconds'),
                    'postgis_available' => $this->postgisAvailable(),
                    'public_storage_linked' => is_link(public_path('storage')),
                ],
                'security' => [
                    'app_key_configured' => filled(config('app.key')),
                    'https_url' => str_starts_with((string) config('app.url'), 'https://'),
                    'mailer' => config('mail.default'),
                ],
                'deployment' => [
                    'run_seeders' => env('RUN_SEEDERS', 'false'),
                    'mobile_server_url_env' => env('GUARANDA_GO_MOBILE_SERVER_URL') ? 'configured' : 'runtime backend only',
                    'migrations_table_exists' => Schema::hasTable(config('database.migrations.table', 'migrations')),
                ],
            ],
        ]);
    }

    private function postgisAvailable(): bool
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return false;
        }

        try {
            return DB::scalar("select exists (select 1 from pg_extension where extname = 'postgis')") === true;
        } catch (\Throwable) {
            return false;
        }
    }
}
