# Laravel Boost y starter kit

El proyecto Laravel vive en `ciclismo-guaranda/` y fue creado con:

- Starter kit: React.
- Autenticación: Laravel built-in authentication/Fortify.
- Registro habilitado.
- Email verification habilitado.
- Two-factor authentication habilitado.
- Passkeys habilitado.
- Password confirmation habilitado.
- Testing: Pest.
- Laravel Boost: instalado.
- Wayfinder: generado.

## Archivo obligatorio

Antes de tocar código dentro de `ciclismo-guaranda/`, lee:

- `ciclismo-guaranda/AGENTS.md`

Ese archivo contiene reglas específicas generadas por Laravel Boost para versiones instaladas, Inertia, Pest, Pint, Wayfinder y estructura del proyecto.

## Reglas Laravel

- Usa Artisan para crear modelos, migraciones, controllers, requests, resources, policies y tests.
- Preferir Form Requests para validación compleja.
- Mantener controladores delgados.
- Usar Actions/Services cuando la lógica de dominio crezca.
- Usar Policies/Gates/Middleware para autorización.
- Usar Eloquent Resources para respuestas API cuando corresponda.
- Usar factories y seeders para catálogos iniciales.
- Usar Pest para tests.
- Usar Wayfinder para rutas tipadas en frontend cuando aplique.

## Validación Laravel

- Formato PHP: `composer lint` o `vendor/bin/pint --dirty --format agent`.
- Tests: `php artisan test --compact` o filtro específico.
- Tipos PHP/Larastan: `composer types:check` si aplica.
