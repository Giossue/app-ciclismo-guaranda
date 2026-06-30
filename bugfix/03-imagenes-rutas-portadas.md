# 03 — Imágenes reales y portadas de rutas

## Problema

La imagen principal se ingresaba como texto y las rutas no mostraban portadas atractivas al ciclista.

## Cambio aplicado

- Se permite subir imagen principal de ruta desde archivo.
- Límite de imagen principal: 5 MB.
- Se permite subir varias imágenes adicionales, 5 MB por archivo.
- Se mantiene compatibilidad con paths existentes.
- Se muestran portadas en listado de rutas y detalle.
- Se muestran miniaturas de POIs si existen imágenes.

## Archivos

- `resources/js/pages/admin/routes/partials/route-form.tsx`
- `app/Http/Controllers/Admin/RouteController.php`
- `app/Http/Requests/Admin/Concerns/ValidatesRoutePayload.php`
- `resources/js/pages/routes/index.tsx`
- `resources/js/pages/routes/show.tsx`
- `resources/js/components/routes/route-map.tsx`
- `resources/js/lib/media.ts`

## Estado

- Completado.
