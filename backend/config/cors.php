<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.2.1:3000',
        'https://aigcafe.com',
        'https://www.aigcafe.com',
        'https://cafeaig.vercel.app',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-Requested-With',
    ],

    'max_age' => 3600,

    'supports_credentials' => true,
];