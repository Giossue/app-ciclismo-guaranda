<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Fondo de <html> antes de que cargue app.css: debe replicar --background --}}
        <style>
            html {
                background-color: #f8f9fa;
            }

            html.dark {
                background-color: #0d0f0d;
            }
        </style>

        {{--
            Inter se descarga en paralelo con el CSS. Sin esto el navegador solo
            descubre el woff2 después de analizar app.css, pinta con la fuente de
            respaldo y salta a Inter al llegar. El guardia evita romper cuando no
            hay build (tests o entorno recién clonado).
        --}}
        @if (file_exists(public_path('build/manifest.json')))
            <link rel="preload" as="font" type="font/woff2" crossorigin
                href="{{ Vite::asset('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2') }}">
        @endif

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Guaranda Go') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
