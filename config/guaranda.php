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
];
