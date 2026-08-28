# Fase 14 — Validación final

Estado: `Requiere revisión`

## Objetivo

Validar integralmente el sistema antes de entrega universitaria.

## Tareas

- Pruebas funcionales.
- Pruebas de seguridad básicas.
- Pruebas offline.
- Pruebas GPS.
- Pruebas de rendimiento básico.
- Pruebas en Android real.
- Pruebas en zonas con mala señal si es posible.
- Validar mapa/ruta/POIs/incidencias/chatbot.
- Preparar APK final.

## Resultado actual

- La validación local de backend/frontend/build/rutas pasa.
- Los módulos web/admin ya no quedan como placeholders.
- La app web desplegada en Dokploy responde correctamente en `https://ciclismo.devs-ueb.tech`.
- GitHub Actions genera APK debug conectado a la URL de producción.
- No se ejecutan seeders en cada deploy salvo que `RUN_SEEDERS=true`.

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

Resultado local:

- Pint: ✅
- Pest: ✅ 131 tests, 754 assertions.
- ESLint: ✅
- TypeScript: ✅
- Prettier check: ✅
- Vite build: ✅
- Route cache: ✅

## Criterios de finalización

- `composer test` / `php artisan test --compact` pasa. ✅
- `npm run types:check` pasa. ✅
- `npm run lint:check` pasa. ✅
- Build frontend pasa. ✅
- Route cache pasa. ✅
- Checklist de aceptación actualizado. ✅
- APK generado por GitHub Actions. ✅
- APK probado en Android real. ⏳ Pendiente externo.

## Pendiente para cierre total

No se marca como `Completado` todavía porque falta evidencia de prueba física en Android 13+:

1. Instalar `app-debug.apk` generado por GitHub Actions.
2. Confirmar que carga `https://ciclismo.devs-ueb.tech`.
3. Probar login.
4. Probar rutas/mapa/POIs.
5. Probar GPS real durante recorrido.
6. Probar cámara en reporte de incidencia.
7. Probar descarga offline, cola y sincronización.
8. Probar permisos/notificaciones.

Cuando esos puntos pasen en dispositivo real, Fase 12 y Fase 14 pueden cambiar a `Completado`.
