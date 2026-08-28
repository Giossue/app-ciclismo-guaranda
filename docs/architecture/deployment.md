# Despliegue y Android

- Dokploy construye el Dockerfile propio con PHP-FPM, Nginx, Supervisor, Node y SSR de Inertia. Debe conservar datos y ejecutar migraciones, no seeders automáticos.
- Producción usa HTTPS y `TrustProxies` para las cabeceras del reverse proxy. Secretos viven exclusivamente en el entorno/Dokploy/GitHub Secrets.
- Redis de producción se conecta solo por la red interna mediante los secretos `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME` (si aplica), `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_CACHE_DB` y prefijos propios. La imagen instala PhpRedis; al activarlo, Dokploy debe definir `CACHE_STORE=redis`. No guardar `REDIS_URL` ni contraseñas en el repositorio. Sesiones y colas permanecen en base de datos hasta que exista una necesidad medida para migrarlas.
- El asistente usa `OPENAI_API_KEY` exclusivamente como secreto de Dokploy. Las preferencias administrativas de GPT-5.6 se guardan sin secretos; el chat y la visión nunca exponen la clave, endpoint ni payload al frontend/APK.
- Supervisor ejecuta `queue:work database` dentro del contenedor. Tras configurar `OPENAI_API_KEY`, las fotos editoriales nuevas de rutas/POIs se procesan en esa cola; no se envían imágenes de incidencias. Revisar los logs del programa `queue-worker` ante un fallo, sin registrar la imagen ni la clave.
- OSRM de Ecuador vive como servicio Compose separado y privado en `dokploy-network`; no tiene dominio ni `ports` publicados. Laravel recibe únicamente `GUARANDA_GO_OSRM_URL=http://osrm:5000` y debe degradarse al dibujo manual si el motor no responde.
- El health check HTTP es `GET /up`: responde `200 {"status":"up"}` sin depender de Inertia SSR ni de diagnósticos de terceros. La imagen lo prueba cada 2 s durante el arranque (Docker Engine 25+) y cada 10 s después; Nginx espera a que PHP-FPM acepte conexiones antes de arrancar. Dokploy debe respetar el estado `healthy` antes de dirigir tráfico durante un despliegue.
- Nginx reserva `fastcgi_buffer_size 32k` y `fastcgi_buffers 16 16k` para respuestas PHP/Inertia: evita `502 upstream sent too big header` cuando la respuesta incorpora cabeceras de sesión y navegación.
- Dokploy realiza el autodespliegue al recibir un `push` a la rama configurada. Los workflows de GitHub Actions para APK, tests y lint quedan temporalmente solo bajo ejecución manual; no se ejecutan por `push` ni por pull request.
- GitHub Actions puede generar el APK manualmente; la URL móvil se inyecta como secreto `GUARANDA_GO_MOBILE_SERVER_URL`, no se hardcodea.
- Capacitor requiere `npm run build` antes de `npx cap sync android`. El APK no se certifica solo con CI: exige prueba física Android 13+ de login, mapa, GPS, cámara, offline, sincronización y notificaciones.
- Health, errores de integración, fallos de jobs y problemas de auth deben ser observables sin registrar secretos ni ubicaciones completas.

Estado actual y comandos: `.codex/progress/current_status.md` y `.codex/workflows/validation_commands.md`.
