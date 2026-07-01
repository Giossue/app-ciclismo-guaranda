# 19 — Plan: subida de imágenes (errores, multiselección y compresión a 5 MB)

## Estado

Implementado 2026-07-01.

## Feedback recibido

- Errores al subir una nueva imagen en un POI y en una ruta.
- En rutas, "imágenes adicionales" no dejaba seleccionar varias imágenes.
- Si un usuario, cliente o admin sube una imagen mayor a 5 MB, debe reducirse
  automáticamente a 5 MB o menos para que se pueda subir.

## Causas detectadas

1. **Límites de PHP en el servidor (causa principal de "errores").** El
   `Dockerfile` no configuraba PHP, así que usaba los valores por defecto
   `upload_max_filesize = 2M` y `post_max_size = 8M`. Cualquier imagen mayor a
   2 MB era descartada por PHP antes de llegar a Laravel (aparecían errores
   confusos de campo requerido/ inválido). Con varias imágenes se superaba
   `post_max_size = 8M` y se descartaba todo el formulario → por eso "no dejaba
   subir varias".
2. **Sin compresión en el cliente.** Una imagen mayor a 5 MB fallaba la
   validación `max:5120` del backend.
3. **UX de multiselección.** Cada nueva selección reemplazaba la anterior y no
   había forma de acumular, previsualizar ni quitar archivos.

## Cambios realizados

### Servidor

- `Dockerfile`: nuevo `conf.d/uploads.ini` con `upload_max_filesize = 25M`,
  `post_max_size = 90M`, `max_file_uploads = 25` y `memory_limit = 256M`
  (soporta imágenes optimizadas y videos de valoraciones de hasta 20 MB × 4).
- `docker/nginx.conf`: `client_max_body_size` de 25M a 90M.

### Frontend

- `resources/js/lib/image-compression.ts`: utilidad `compressImageToLimit` que
  reescala y recomprime con canvas (JPEG) hasta dejar la imagen en el límite
  (5 MB por defecto) o menos. Respeta orientación EXIF vía `createImageBitmap`,
  fondo blanco para PNG con transparencia y solo toca formatos raster.
- `resources/js/components/image-file-input.tsx`: input reutilizable que
  comprime al seleccionar, acumula multiselección, previsualiza con opción de
  quitar, escribe los archivos comprimidos de vuelta al `<input>` real vía
  `DataTransfer` (para que el `<Form>` de Inertia los envíe) e informa su estado
  de procesamiento para deshabilitar el botón mientras optimiza.
- Integrado en: formulario de rutas (imagen principal + imágenes adicionales),
  formulario de POIs (imágenes), valoraciones de ciclista (fotos/videos, solo
  comprime imágenes) e incidencias de ciclista (foto).

## Validación

- `npm run types:check`, `npm run lint:check`, `npm run format:check` y
  `npm run build` pasan.
- Wayfinder regenerado con `php artisan wayfinder:generate --with-form`.

## Imágenes que no se visualizan ("dañadas") 2026-07-01

- Causa: datos de rutas con `main_image_path` apuntando a archivos inexistentes,
  p. ej. `Routes/img1.png` (con `R` mayúscula; el flujo real guarda en `routes`
  minúscula con nombre hash). La URL `/storage/Routes/img1.png` responde 404.
- El flujo de subida y el serving del disco `public` funcionan (un archivo real
  `pois/xxxx.jpg` responde HTTP 200). El problema es solo el dato semilla/manual.
- Fix de código: `resources/js/components/image-with-fallback.tsx` muestra un
  placeholder en vez del ícono de imagen rota cuando el archivo no existe.
  Integrado en `routes/index`, `routes/show` (portada y POIs) y el preview de
  portada del formulario admin de rutas.
- Fix de datos (ejecutar en el servidor, desde `/var/www/html`): limpiar rutas
  con portada inexistente para que muestren "sin portada" y luego resubir la
  imagen real desde el admin:

  ```bash
  php artisan tinker --execute="\App\Models\CyclingRoute::whereNotNull('main_image_path')->get()->each(function(\$r){ if(! \Illuminate\Support\Facades\Storage::disk('public')->exists(\$r->main_image_path)){ \$r->forceFill(['main_image_path'=>null])->saveQuietly(); } });"
  ```

## Pendiente de prueba manual

- Subir imagen > 5 MB en ruta/POI y confirmar que se optimiza y guarda.
- Seleccionar varias imágenes adicionales en ruta y confirmar que se acumulan.
- Confirmar en despliegue que los nuevos límites PHP/nginx aplican.
