# Despliegue y Android

- Dokploy construye el Dockerfile propio con PHP-FPM, Nginx, Supervisor, Node y SSR de Inertia. Debe conservar datos y ejecutar migraciones, no seeders automáticos.
- Producción usa HTTPS y `TrustProxies` para las cabeceras del reverse proxy. Secretos viven exclusivamente en el entorno/Dokploy/GitHub Secrets.
- GitHub Actions genera el APK; la URL móvil se inyecta como secreto `GUARANDA_GO_MOBILE_SERVER_URL`, no se hardcodea.
- Capacitor requiere `npm run build` antes de `npx cap sync android`. El APK no se certifica solo con CI: exige prueba física Android 13+ de login, mapa, GPS, cámara, offline, sincronización y notificaciones.
- Health, errores de integración, fallos de jobs y problemas de auth deben ser observables sin registrar secretos ni ubicaciones completas.

Estado actual y comandos: `.codex/progress/current_status.md` y `.codex/workflows/validation_commands.md`.
