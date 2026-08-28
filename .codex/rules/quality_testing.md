# Calidad, lint, tests y validación

## Principio

No afirmes que algo funciona si no ejecutaste una validación real y viste el resultado.

## Validaciones por tipo de cambio

### PHP/Laravel

- Formato: `composer lint` o `vendor/bin/pint --dirty --format agent`.
- Tests: `php artisan test --compact` o test específico.
- Análisis estático: `composer types:check` si aplica.

### Frontend React/Inertia

- Tipos: `npm run types:check`.
- Lint: `npm run lint:check`.
- Formato: `npm run format:check`.
- Build si cambias assets críticos: `npm run build`.

### Android/Capacitor

- Ejecutar build web antes de sincronizar: `npm run build`.
- Sincronizar Capacitor cuando cambien plugins/assets: `npx cap sync android`.
- Probar en dispositivo Android real para GPS, cámara, offline y pantalla bloqueada.

## Tests mínimos esperados

- Feature tests para endpoints críticos.
- Tests de autorización por rol.
- Tests de validación de formularios.
- Tests de reglas de negocio: recorrido válido 90%, valoración una por usuario/ruta, incidencias después de revisión.
- Pruebas manuales en Android para GPS/offline.
