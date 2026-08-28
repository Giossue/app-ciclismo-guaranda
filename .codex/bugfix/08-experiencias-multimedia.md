# 08 — Experiencias multimedia del ciclista

## Problema

El tester pidió subir fotos o videos de la experiencia del usuario, no como dato textual de rutas.

## Cambio aplicado

- Se creó tabla `archivos_valoracion_ruta` mediante migración.
- Se agregó modelo `RouteRatingFile`.
- Las valoraciones aceptan hasta 4 archivos por envío.
- Formatos aceptados: JPG, PNG, WebP, MP4, MOV y WebM.
- Límite: 20 MB por archivo.
- Los comentarios aprobados muestran imágenes/videos asociados.

## Archivos

- `database/migrations/2026_06_30_000015_create_route_rating_files_table.php`
- `app/Models/RouteRatingFile.php`
- `app/Models/RouteRating.php`
- `app/Http/Requests/Cyclist/StoreRouteRatingRequest.php`
- `app/Http/Controllers/Cyclist/RouteRatingController.php`
- `app/Http/Controllers/Cyclist/RouteController.php`
- `resources/js/pages/routes/show.tsx`
- `resources/js/types/routes.ts`

## Estado

- Completado.
