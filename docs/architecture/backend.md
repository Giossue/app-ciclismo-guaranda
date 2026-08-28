# Backend Laravel

## Patrón requerido

- Rutas/controladores manejan HTTP, respuesta y coordinación; no concentran reglas de negocio extensas.
- Las entradas complejas usan Form Requests; API responses usan Resources cuando el contrato lo requiere.
- Las Policies/Middleware verifican autorización por registro en servidor. La navegación React solo es una ayuda visual.
- Actions/Services encapsulan lógica reutilizable, geoespacial, archivos, sincronización e integraciones.
- Jobs manejan operaciones costosas, reintentables o independientes de una petición.

## Límites

- Nunca pasar objetos `Request` o `Response` a reglas de dominio/servicios.
- No concatenar entrada de usuario en SQL, rutas de archivo, comandos o URLs de integración.
- No llamar servicios externos protegidos desde el frontend ni retornar sus payloads sin normalizarlos.
- Usar Artisan para scaffolding cuando aplique y Pest para las pruebas.

Consulta `.codex/architecture/backend_laravel.md` y el skill `laravel-best-practices` antes de código Laravel.
