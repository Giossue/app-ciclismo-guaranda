# Fase 06 — Puntos de interés

Estado: `Completado`

## Objetivo

Gestionar y mostrar puntos de interés vinculados a rutas.

## Tareas

- CRUD admin de POIs.
- Detalles por categoría:
  - comida,
  - tienda,
  - taller,
  - salud,
  - hospedaje,
  - mirador.
- Horarios.
- Imágenes.
- Asociación POI-ruta.
- Sugerencias de POIs por ciclistas.
- Reportes de POIs cerrados/datos incorrectos.

## Criterios de finalización

- Admin gestiona POIs.
- Ciclista ve POIs de su ruta.
- Ciclista puede sugerir/reportar POI.
- Tests principales pasan.


## Resultado

- CRUD administrativo de POIs implementado con categoría, horarios, imágenes, asociación ruta-POI y detalles por categoría.
- Ciclistas pueden ver POIs activos en el detalle de ruta.
- Ciclistas pueden sugerir POIs y reportar POIs cerrados/datos incorrectos.
- POIs inactivos se ocultan del detalle de ruta y no pueden ser reportados por ciclistas.
- No se requirió migración ni operación de BD remota: el esquema existente ya cubría la fase.

## Validación ejecutada

```bash
php ciclismo-guaranda/artisan wayfinder:generate --with-form --no-interaction
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='AdminPoiManagementTest|CyclistPoiInteractionTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
## Bugfix testers 2026-06-30

- Los POIs activos pueden seleccionarse desde el formulario de ruta como puntos intermedios.
- Los popups y tarjetas de POIs muestran miniatura cuando existe imagen.

