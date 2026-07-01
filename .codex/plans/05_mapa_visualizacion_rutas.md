# Fase 05 — Mapa y visualización de rutas

Estado: `Completado`

## Objetivo

Mostrar rutas activas en mapa y permitir al ciclista consultar detalle.

## Tareas

- Integrar Leaflet. ✅
- Mostrar rutas activas. ✅
- Mostrar detalle de ruta. ✅
- Mostrar punto de inicio/final. ✅
- Mostrar POIs de ruta cuando existan. ✅
- Mostrar incidencias validadas activas. ✅
- Mostrar ubicación actual si el usuario concede permiso. ✅
- Indicadores de conexión/GPS. ✅

## Criterios de finalización

- Mapa carga en Android/navegador. ✅
- Rutas activas se muestran correctamente. ✅
- Detalle de ruta muestra métricas y recomendaciones. ✅
- Tests o validación manual documentada. ✅

## Notas de implementación

- Se integró `leaflet` + `react-leaflet` en el frontend.
- `/routes` muestra un mapa con todas las rutas activas, trazados GeoJSON, inicio/final, POIs asociados e incidencias en estado `en revisión`.
- `/routes/{slug}` muestra detalle de ruta activa con mapa, métricas, recomendaciones, observaciones, POIs e incidencias activas.
- Las rutas inactivas/borrador no son visibles en listado ni detalle de ciclista.
- El componente de mapa incluye indicadores de conexión y estado GPS, y solicita geolocalización del navegador/WebView cuando el usuario toca “Ubicación actual”.
- No hizo falta migración nueva: las tablas existentes ya cubren geometrías, POIs, pivote ruta-POI e incidencias.
- No se ejecutó operación de BD remota porque no hubo cambio de esquema/datos que aplicar.

## Validación ejecutada

```bash
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='RouteMapVisualizationTest|CyclistRouteVisibilityTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
## Bugfix testers 2026-06-30

- Se agregó editor de trazado con Leaflet.draw en admin para evitar líneas rectas por GeoJSON manual.
- Se agregó geocoder OSM/Nominatim para ubicar lugares al crear/editar rutas.
- El mapa de ciclista muestra navegación externa hacia el inicio y popups enriquecidos con imágenes.

