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

    'elevation' => [
        'provider' => env('GUARANDA_GO_ELEVATION_PROVIDER', 'opentopodata'),
        'opentopodata' => [
            'base_url' => env('GUARANDA_GO_OPENTOPO_BASE_URL', 'https://api.opentopodata.org'),
            'dataset' => env('GUARANDA_GO_OPENTOPO_DATASET', 'srtm90m'),
            'interpolation' => env('GUARANDA_GO_OPENTOPO_INTERPOLATION', 'bilinear'),
            'timeout_seconds' => (int) env('GUARANDA_GO_OPENTOPO_TIMEOUT_SECONDS', 15),
            'max_samples' => (int) env('GUARANDA_GO_OPENTOPO_MAX_SAMPLES', 100),
        ],
    ],

    'deployment' => [
        'run_seeders' => env('RUN_SEEDERS', 'false'),
        'mobile_server_url' => env('GUARANDA_GO_MOBILE_SERVER_URL'),
    ],
];
