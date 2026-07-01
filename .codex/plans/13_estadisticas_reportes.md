# Fase 13 — Estadísticas y reportes

Estado: `Completado`

## Objetivo

Dar al administrador métricas y exportaciones útiles.

## Tareas

- Rutas más consultadas.
- Rutas más descargadas.
- Rutas mejor calificadas.
- Incidencias por estado.
- Usuarios activos.
- Recorridos completados.
- Filtros por fecha.
- Exportación CSV/Excel/PDF según alcance técnico.

## Resultado implementado

- Se reemplazó el módulo placeholder por `/admin/statistics` real.
- Se registran consultas de rutas al abrir el detalle de una ruta activa.
- El administrador puede filtrar métricas por fecha `from`/`to`.
- Se muestran métricas operativas:
  - usuarios activos,
  - rutas registradas,
  - consultas de rutas,
  - descargas offline,
  - recorridos completados,
  - incidencias reportadas.
- Se muestran rankings:
  - rutas más consultadas,
  - rutas más descargadas,
  - rutas mejor calificadas con valoraciones aprobadas,
  - incidencias por estado.
- Se agregó exportación CSV en `/admin/statistics/export`.

## Criterios de finalización

- Dashboard admin muestra métricas. ✅
- Filtros funcionan. ✅
- Al menos una exportación funcional. ✅ CSV.

## Validación ejecutada

```bash
vendor/bin/pint --dirty --format agent
php artisan test --compact
npm run lint:check
npm run types:check
npm run format:check
npm run build
php artisan route:cache --no-interaction
```

Resultado: validación local aprobada.
