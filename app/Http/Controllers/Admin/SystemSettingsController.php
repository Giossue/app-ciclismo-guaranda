<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Ai\AssistantConfiguration;
use App\Services\Ai\VectorRuntimeInspector;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function __construct(
        private readonly AssistantConfiguration $assistantConfiguration,
        private readonly VectorRuntimeInspector $vectorRuntimeInspector,
    ) {}

    public function __invoke(): Response
    {
        $this->authorize('viewAny', User::class);
        $databaseCapabilities = $this->vectorRuntimeInspector->inspect(DB::connection());

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
                    'openai_configured' => filled(config('guaranda.assistant.openai.api_key'))
                        && $this->assistantConfiguration->chat()['model'] !== null,
                    'openai_vision_configured' => filled(config('guaranda.assistant.openai.api_key'))
                        && $this->assistantConfiguration->vision()['model'] !== null,
                    'openai_timeout_seconds' => config('guaranda.assistant.openai.timeout_seconds'),
                    'postgis_available' => $databaseCapabilities['postgis_installed'],
                    'postgis_runtime' => $databaseCapabilities['postgis_runtime'],
                    'pgvector_available' => $databaseCapabilities['vector_available'],
                    'pgvector_runtime' => $databaseCapabilities['vector_runtime'],
                    'public_storage_linked' => is_link(public_path('storage')),
                ],
                'security' => [
                    'app_key_configured' => filled(config('app.key')),
                    'https_url' => str_starts_with((string) config('app.url'), 'https://'),
                    'mailer' => config('mail.default'),
                ],
                'deployment' => [
                    'run_seeders' => config('guaranda.deployment.run_seeders', 'false'),
                    'mobile_server_url_env' => filled(config('guaranda.deployment.mobile_server_url')) ? 'configured' : 'runtime backend only',
                    'migrations_table_exists' => Schema::hasTable(config('database.migrations.table', 'migrations')),
                ],
            ],
            'assistantConfiguration' => [
                'chat_model' => $this->assistantConfiguration->chat()['model'],
                'chat_reasoning_effort' => $this->assistantConfiguration->chat()['reasoning_effort'],
                'vision_model' => $this->assistantConfiguration->vision()['model'],
                'vision_reasoning_effort' => $this->assistantConfiguration->vision()['reasoning_effort'],
            ],
        ]);
    }
}
