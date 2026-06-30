# 06 — Visualización de mapa para ciclista

## Problema

El ciclista veía trazado, inicio/final y POIs, pero no tenía ayuda clara para llegar al punto de inicio ni popups ricos con fotos.

## Cambio aplicado

- Se agregó botón `Ir al inicio` cuando existe ubicación actual.
- Se dibuja una conexión referencial desde ubicación actual al inicio de la ruta seleccionada.
- El enlace abre navegación externa en Google Maps con modo bicicleta.
- Los popups de ruta y POIs muestran imagen cuando existe.
- Los popups de POIs incluyen descripción, dirección, km y observación de ruta.

## Archivos

- `resources/js/components/routes/route-map.tsx`

## Estado

- Completado.
