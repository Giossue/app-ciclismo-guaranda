# Fase 10 — Favoritos, valoraciones y comentarios

Estado: `Completado`

## Objetivo

Permitir guardar rutas favoritas y valorar rutas completadas.

## Tareas

- Guardar/quitar favoritos.
- Listar favoritos.
- Validar que solo rutas completadas puedan valorarse.
- Una valoración por usuario por ruta.
- Moderación de comentarios.
- Respuesta de administrador.
- Promedio de calificaciones aprobadas.

## Criterios de finalización

- Favoritos funcionan.
- Valoración requiere recorrido válido.
- Moderación controla visibilidad.
- Promedio ignora rechazadas.


## Resultado implementado

- Se implementó guardar/quitar favoritos y listado `/favorites`.
- Se agregó valoración de rutas desde el detalle, condicionada a tener al menos un recorrido finalizado válido (`is_valid=true`).
- Se conserva una valoración por usuario/ruta; nuevos envíos actualizan/restauran la valoración existente y vuelven a estado `pendiente`.
- Se implementó moderación administrativa en `/admin/ratings` con estados `pendiente`, `aprobado`, `oculto` y `rechazado`, más respuesta administrativa.
- El detalle de ruta muestra promedio y total solo con valoraciones `aprobado`, ignorando pendientes/rechazadas/ocultas.
- Los comentarios visibles para ciclistas son solo los aprobados.
- No se creó migración nueva ni se aplicaron cambios de BD remota: el esquema existente ya contenía favoritos, valoraciones y estados de moderación.
## Bugfix testers 2026-06-30

- Se agregó tabla `archivos_valoracion_ruta` para fotos/videos de experiencias asociadas a valoraciones.
- Las valoraciones aceptan hasta 4 archivos JPG/PNG/WebP/MP4/MOV/WebM, máximo 20 MB por archivo.
- Los archivos se muestran públicamente solo junto a comentarios aprobados.

