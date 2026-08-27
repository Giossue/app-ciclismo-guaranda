# Datos y migraciones

- Producción usa PostgreSQL + PostGIS; SQLite solo mantiene compatibilidad de pruebas locales y el offline Android no sustituye la base central.
- Eloquent y las migraciones Laravel son la fuente de verdad del schema. El schema funcional está en español; tablas internas requeridas por Laravel conservan sus nombres compatibles.
- Cambios estructurales se hacen con migraciones. Datos reales de producción se cargan directamente y de forma explícita; seeders/factories son para desarrollo, pruebas o carga intencional.
- El despliegue normal no ejecuta seeders (`RUN_SEEDERS` ausente o `false`).
- Cambios destructivos requieren plan de datos, backup/verificación y migración reversible cuando sea posible.
- Considerar índices, carga anticipada y paginación para evitar N+1 y listas costosas; no optimizar sin una medición.

Reglas operativas completas: `.codex/rules/database_operations.md` y `.codex/architecture/database_postgis.md`.
