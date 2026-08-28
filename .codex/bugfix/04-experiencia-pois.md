# 04 — Experiencia requerida y POIs intermedios

## Problema

La experiencia requerida era texto libre y la asociación de POIs a rutas no era cómoda para admin.

## Cambio aplicado

- La experiencia requerida ahora se selecciona con checkboxes guiados.
- Se guarda como texto compatible con el esquema existente.
- El formulario de ruta permite seleccionar POIs activos para vincularlos al recorrido.
- Los POIs seleccionados aparecen como puntos interactivos en el mapa del ciclista.

## Archivos

- `resources/js/pages/admin/routes/partials/route-form.tsx`
- `app/Http/Controllers/Admin/RouteController.php`
- `app/Http/Requests/Admin/Concerns/ValidatesRoutePayload.php`

## Estado

- Completado.
