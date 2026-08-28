# Fase 07 — Incidencias

Estado: `Completado`

## Objetivo

Permitir reportar incidencias y mostrarlas solo después de revisión administrativa.

## Tareas

- Formulario de reporte.
- Tipo de incidencia.
- Ubicación en mapa/GPS.
- Foto hasta 5 MB.
- Estado inicial: reportada.
- Notificación al administrador.
- Revisión admin.
- Mostrar solo incidencias validadas/en revisión según regla definida.

## Criterios de finalización

- Usuario reporta incidencia online.
- Admin la revisa/cambia estado.
- Ciclistas ven solo incidencias validadas activas.
- Tests de visibilidad/autorización pasan.


## Resultado

- Ciclistas pueden reportar incidencias online desde el detalle de ruta activa.
- El reporte exige tipo, título, descripción, ubicación y permite una foto opcional de hasta 5 MB.
- Las incidencias nuevas se crean con estado `reportada` y no se muestran públicamente.
- Se crean notificaciones internas para administradores al registrar una incidencia.
- Admin revisa incidencias desde `/admin/incidents`, cambia estado y registra respuesta administrativa.
- Solo incidencias con estado `en revisión` se muestran a ciclistas sobre rutas/mapa como incidencias activas validadas.
- No se requirió migración ni operación de BD remota: el esquema existente ya cubría incidencias, archivos y notificaciones.

## Validación ejecutada

```bash
php ciclismo-guaranda/artisan wayfinder:generate --with-form --no-interaction
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='AdminIncidentReviewTest|CyclistIncidentReportTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
