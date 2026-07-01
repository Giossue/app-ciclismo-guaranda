# 10 — Plan: portadas, storage y media en producción

## Estado

Pendiente de aprobación.

## Feedback recibido

- “No se visualiza la portada de la ruta posible enlace simbólico no activo”.
- Las imágenes de portada deben verse en listado, detalle y popup de mapa cuando la ruta tenga `main_image_path`.

## Observación técnica actual

- El frontend resuelve rutas relativas con `resources/js/lib/media.ts` hacia `/storage/{path}`.
- `config/filesystems.php` define el disco `public` en `storage/app/public` y el link `public/storage` → `storage/app/public`.
- `docker/entrypoint.sh` ya ejecuta `php artisan storage:link --force --no-interaction || true`.
- Si la portada no carga en producción, la causa probable no es solo React: puede ser link roto, volumen no persistido, archivos subidos en otro contenedor/capa, permisos, cache o path guardado incorrecto.

## Alcance propuesto

### 1. Diagnóstico de producción

- Verificar si `public/storage` existe dentro del contenedor y apunta a `storage/app/public`.
- Verificar si el archivo físico de una portada existe realmente en `storage/app/public/{main_image_path}`.
- Verificar permisos/propietario de `storage/` y `public/storage`.
- Probar una URL real `/storage/...` desde producción y confirmar si responde `200`, `404` o `403`.
- Revisar si Dokploy monta `storage/` como volumen persistente; si no, los archivos subidos pueden perderse entre deploys.

### 2. Corrección prevista si se confirma link/volumen

- Mantener `storage:link` idempotente en runtime, pero reforzar el plan de deploy para asegurar:
  - `storage/app/public` persistente.
  - `public/storage` recreado si queda como archivo/directorio inválido.
  - permisos correctos para `www-data`.
- No mover imágenes al repo ni a `public/` manualmente.
- No usar seeders para cargar imágenes reales de producción.

### 3. Corrección UX defensiva

- Agregar fallback visual cuando una imagen falla al cargar, no solo cuando `main_image_path` es `null`.
- Aplicar el fallback en:
  - `resources/js/pages/routes/index.tsx` (`RouteCover`).
  - `resources/js/pages/routes/show.tsx` (`RouteHero`).
  - `resources/js/components/routes/route-map.tsx` (`RoutePopup` y `PoiPopup`).

## Archivos que se tocarían después de aprobar

- `docker/entrypoint.sh` si se confirma problema de link/permisos.
- Configuración de Dokploy/volumen si se confirma falta de persistencia, sin guardar secretos en repo.
- `resources/js/pages/routes/index.tsx`.
- `resources/js/pages/routes/show.tsx`.
- `resources/js/components/routes/route-map.tsx`.
- Posiblemente tests de frontend/tipos si se agrega componente fallback.

## Datos/BD

- No se espera migración.
- Puede requerirse corrección directa de datos reales si existen rutas con `main_image_path` apuntando a archivos que no existen.
- Si hay que corregir datos reales en producción, será directo en BD o desde admin, no con seeders.

## Criterios de aceptación

- Una ruta con portada muestra imagen en:
  - listado de rutas,
  - detalle de ruta,
  - popup del mapa.
- Si el archivo no existe o falla la carga, se muestra fallback claro sin romper layout.
- Después de redeploy, las imágenes subidas siguen existiendo.
- `/storage/...` responde correctamente para archivos públicos reales.

## Validación mínima cuando se implemente

- Probar URL real de una imagen en producción.
- `npm run types:check`.
- `npm run lint:check`.
- `npm run build` si cambia UI/assets.
- Si se toca Docker: redeploy controlado en Dokploy y verificación post-deploy.
