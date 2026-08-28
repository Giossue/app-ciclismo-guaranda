<?php

return [
    'initial_admin' => [
        'name' => env('GUARANDA_GO_ADMIN_NAME', 'Administrador Guaranda Go'),
        'email' => env('GUARANDA_GO_ADMIN_EMAIL'),
        'password' => env('GUARANDA_GO_ADMIN_PASSWORD'),
    ],

    'assistant' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('GUARANDA_GO_OPENAI_MODEL'),
            'vision_model' => env('GUARANDA_GO_OPENAI_VISION_MODEL'),
            'timeout_seconds' => (int) env('GUARANDA_GO_OPENAI_TIMEOUT_SECONDS', 20),
            'connect_timeout_seconds' => (int) env('GUARANDA_GO_OPENAI_CONNECT_TIMEOUT_SECONDS', 3),
            'max_output_tokens' => (int) env('GUARANDA_GO_OPENAI_MAX_OUTPUT_TOKENS', 700),
            'vision_max_image_bytes' => (int) env('GUARANDA_GO_OPENAI_VISION_MAX_IMAGE_BYTES', 5 * 1024 * 1024),
        ],
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

    'routing' => [
        'osrm' => [
            'base_url' => env('GUARANDA_GO_OSRM_URL'),
            'timeout_seconds' => (int) env('GUARANDA_GO_OSRM_TIMEOUT_SECONDS', 5),
            'connect_timeout_seconds' => (int) env('GUARANDA_GO_OSRM_CONNECT_TIMEOUT_SECONDS', 1),
        ],
    ],

    'deployment' => [
        'run_seeders' => env('RUN_SEEDERS', 'false'),
        'mobile_server_url' => env('GUARANDA_GO_MOBILE_SERVER_URL'),
    ],
];
