# App híbrida Android con Capacitor

## Objetivo

Empaquetar el frontend React/Inertia como APK Android y usar plugins nativos para funciones críticas.

## Capacidades nativas requeridas

- GPS/geolocalización.
- Seguimiento con pantalla bloqueada mediante servicio en primer plano si se implementa.
- Cámara para incidencias.
- Filesystem para imágenes/mapas/rutas descargadas.
- SQLite local para offline.
- Estado de red.
- Notificaciones locales.

## Reglas

- No colocar secretos en el APK.
- Probar en dispositivo Android real, no solo navegador.
- Android objetivo: 13+.
- Distribución inicial: APK básica para proyecto universitario.
- Si se agrega un plugin Capacitor, verificar documentación actual con Context7.

## Permisos esperados

- Ubicación precisa.
- Ubicación en segundo plano si se habilita seguimiento con pantalla bloqueada.
- Cámara.
- Notificaciones.
- Acceso a almacenamiento/archivos según versión Android y plugin.
- Internet.

## Flujo técnico sugerido

1. `npm run build`.
2. `npx cap sync android`.
3. Compilar APK en Android Studio o Gradle.
4. Probar login, mapa, GPS, cámara, offline y sincronización.
