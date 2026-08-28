# Fase 03 — Panel administrador base

Estado: `Completado`

## Objetivo

Crear la base del panel administrador mobile first para gestionar el sistema.

## Tareas

- Definir layout administrador.
- Proteger rutas admin por rol.
- Crear navegación admin:
  - rutas,
  - POIs,
  - incidencias,
  - usuarios,
  - comentarios/valoraciones,
  - catálogos,
  - estadísticas,
  - configuración.
- Crear componentes base con shadcn/ui.
- Crear dashboard inicial con métricas simples.

## Criterios de finalización

- Solo admin accede al panel.
- Navegación admin funcional.
- UI mobile first.
- Tests básicos de autorización pasan.

## Resultado

- Se creó `AdminLayout` para páginas `admin/*`, integrado con el layout principal Inertia.
- Se creó navegación administrativa compartida con módulos: resumen, rutas, POIs, incidencias, usuarios, valoraciones, catálogos, estadísticas y configuración.
- Se agregó dashboard admin en `/admin/dashboard` con métricas simples: usuarios, usuarios activos, rutas, POIs, incidencias y valoraciones.
- Se agregó `/admin` como redirección al dashboard administrativo.
- Se agregaron páginas base/placeholder funcionales para módulos administrativos pendientes.
- Se mantuvo `/admin/users` como módulo funcional creado en fase 02.
- Todas las rutas admin siguen protegidas por `auth`, `verified` y middleware `admin`.
- Se usaron componentes shadcn/ui existentes: `Card`, `Badge`, `Alert`, `Button`, `Separator`.
- Se regeneró Wayfinder para nuevas rutas/controladores.
- No se ejecutaron migraciones, seeders ni cambios contra BD remota en esta fase.

## Validación ejecutada

```bash
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='AdminPanelBaseTest|AdminUserManagementTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```

Resultados:

- Tests focalizados admin: 27 tests, 47 assertions, aprobado.
- `composer test`: 72 tests, 315 assertions, aprobado.
- `npm run types:check`: aprobado.
- `npm run lint:check`: aprobado.
- `npm run format:check`: aprobado.
- `npm run build`: aprobado.
