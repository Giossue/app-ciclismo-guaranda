<?php

return [
    'initial_admin' => [
        'name' => env('GUARANDA_GO_ADMIN_NAME', 'Administrador Guaranda Go'),
        'email' => env('GUARANDA_GO_ADMIN_EMAIL'),
        'password' => env('GUARANDA_GO_ADMIN_PASSWORD'),
    ],

    'n8n' => [
        'webhook_url' => env('GUARANDA_GO_N8N_WEBHOOK_URL'),
        'timeout_seconds' => (int) env('GUARANDA_GO_N8N_TIMEOUT_SECONDS', 20),
    ],

    'deployment' => [
        'run_seeders' => env('RUN_SEEDERS', 'false'),
        'mobile_server_url' => env('GUARANDA_GO_MOBILE_SERVER_URL'),
    ],
];
