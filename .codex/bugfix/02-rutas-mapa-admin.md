# 02 — Creación/edición de rutas con mapa

## Problema

La ruta se creaba escribiendo coordenadas y GeoJSON manualmente. Esto podía producir líneas rectas si solo se ingresaban inicio/final.

## Cambio aplicado

- Se agregó editor Leaflet al formulario admin de rutas.
- Se integró Leaflet.draw para dibujar/editar el LineString.
- Se integró leaflet-control-geocoder con Nominatim/OSM para búsqueda de lugares.
- El primer vértice del trazado se guarda como inicio y el último como final.
- Se calcula distancia total del trazado y se coloca en la métrica de distancia.
- Se eliminó el GeoJSON falso por defecto en creación.

## Archivos

- `resources/js/components/admin/routes/route-geometry-editor.tsx`
- `resources/js/pages/admin/routes/partials/route-form.tsx`
- `app/Http/Controllers/Admin/RouteController.php`
- `app/Http/Requests/Admin/Concerns/ValidatesRoutePayload.php`
- `package.json`
- `package-lock.json`

## Estado

- Completado.
