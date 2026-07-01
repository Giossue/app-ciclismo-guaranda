# Fase 04 — Gestión administrativa de rutas

Estado: `Completado`

## Objetivo

Permitir que el administrador cree, edite, publique e inactive rutas oficiales.

## Tareas

- CRUD de rutas. ✅
- Estados: borrador, activa, inactiva. ✅
- Categoría y dificultad. ✅
- Imagen principal e imágenes adicionales. ✅
- Recomendaciones y observaciones. ✅
- Geometría GeoJSON. ✅
- Guardar `geom` PostGIS cuando aplique. ✅
- Métricas básicas: distancia, tiempo, desnivel. ✅
- Versionado `version_ruta`. ✅

## Criterios de finalización

- Admin crea ruta completa. ✅
- Ruta activa aparece al ciclista. ✅
- Ruta inactiva no aparece al ciclista. ✅
- Cambios relevantes incrementan versión. ✅
- Tests de CRUD/autorización pasan. ✅

## Notas de implementación

- El CRUD administrativo quedó disponible en `/admin/routes` con creación, edición e inactivación de rutas.
- La eliminación administrativa se implementó como cambio de estado a `inactiva`, sin borrado físico.
- La geometría se ingresa como GeoJSON `LineString` en textarea durante esta fase; el dibujo/visualización sobre mapa queda para la Fase 05.
- `geom` PostGIS se actualiza únicamente cuando el driver es `pgsql` y la columna existe, para mantener compatibilidad con SQLite en tests.
- Se agregó `/routes` protegido por login para listar únicamente rutas con estado `activa`.
- No se ejecutaron migraciones, seeders ni cambios contra la BD remota durante esta fase.

## Validación ejecutada

```bash
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='AdminRouteManagementTest|CyclistRouteVisibilityTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
## Bugfix testers 2026-06-30

- El formulario admin de rutas ahora permite subir imagen principal y galería como archivos, con compatibilidad para paths existentes.
- La experiencia requerida pasó de texto abierto a selección guiada múltiple.
- El formulario de ruta permite vincular POIs activos directamente.

