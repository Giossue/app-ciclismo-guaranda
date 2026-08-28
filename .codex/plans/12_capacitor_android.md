# Fase 12 — Capacitor Android y APK

Estado: `Requiere revisión`

## Objetivo

Empaquetar la aplicación como APK Android híbrida.

## Tareas

- Instalar/configurar Capacitor.
- Agregar proyecto Android.
- Configurar plugins:
  - geolocalización,
  - cámara,
  - filesystem,
  - SQLite,
  - network,
  - notificaciones locales.
- Build web.
- Sync Android.
- Generar APK básico.
- Probar en Android 13+.

## Criterios de finalización

- APK instala.
- Login funciona.
- Mapa funciona.
- GPS/cámara/offline funcionan o quedan documentados con bloqueo específico.

## Avance realizado

- Se instaló y configuró Capacitor 8 para Android con app id `ec.edu.ueb.guarandago` y nombre `Guaranda Go`.
- Se agregó el proyecto nativo Android en `ciclismo-guaranda/android/`.
- Se instalaron y sincronizaron plugins nativos:
  - `@capacitor/geolocation`
  - `@capacitor/camera`
  - `@capacitor/filesystem`
  - `@capacitor/network`
  - `@capacitor/local-notifications`
  - `@capacitor-community/sqlite`
- Se agregó `capacitor.config.ts` con `GUARANDA_GO_MOBILE_SERVER_URL` opcional para cargar el backend Laravel/Inertia desde una URL HTTPS sin hardcodearla en el repo.
- Se agregó `capacitor-www/index.html` como fallback estático requerido por Capacitor; el frontend real de la app sigue viviendo en Laravel/Inertia.
- Se agregó capa `resources/js/lib/native/capacitor.ts` para usar Network, GPS, cámara, filesystem y notificaciones con fallback web.
- Se integró el estado de red nativo en la pantalla de chat.
- Se agregaron permisos Android para internet, estado de red, ubicación, cámara, imágenes y notificaciones.
- Se configuró `minSdkVersion = 33` para Android 13+.
- `npm run build`, `npx cap sync android` y `npx cap doctor android` funcionan.
- Se creó workflow online en GitHub Actions: `.github/workflows/android-apk.yml`.
- Se configuró el secret de GitHub `GUARANDA_GO_MOBILE_SERVER_URL` con `https://ciclismo.devs-ueb.tech`.
- GitHub Actions generó correctamente el APK debug como artifact `guaranda-go-debug-apk`.

## Estado actual

La compilación APK ya está resuelta mediante GitHub Actions, sin instalar Android Studio localmente.

Run exitoso:

```txt
android-apk / Build debug APK ✅
Run ID: 28440300576
Artifact: guaranda-go-debug-apk
APK interno: app-debug.apk
Tamaño aproximado: 17.3 MB
```

Descarga desde:

```txt
https://github.com/Giossue/app-ciclismo-guaranda/actions
```

Abrir el último run exitoso de `android-apk` y descargar el artifact `guaranda-go-debug-apk`.

## Pendiente para completar la fase

La fase queda en `Requiere revisión` porque falta validación manual en Android 13+:

1. Descargar `guaranda-go-debug-apk` desde GitHub Actions.
2. Extraer el ZIP del artifact.
3. Instalar `app-debug.apk` en un dispositivo Android 13+.
4. Validar:
   - la APK instala correctamente,
   - carga `https://ciclismo.devs-ueb.tech`,
   - login funciona,
   - mapa funciona,
   - GPS solicita permiso y obtiene ubicación,
   - cámara solicita permiso y permite foto para incidencia,
   - flujo offline descarga/cola/sincroniza según lo implementado,
   - notificaciones locales solicitan permiso si se usan.

Si alguna capacidad nativa falla en dispositivo, registrar el bloqueo específico y corregirlo.

## Validación ejecutada

Local:

```bash
npm run build
npx cap sync android
npx cap doctor android
npm run types:check
npm run lint:check
npm run format:check
```

GitHub Actions:

```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
cp .env.example .env
php artisan key:generate --no-interaction
npm ci
npm run build
GUARANDA_GO_MOBILE_SERVER_URL=https://ciclismo.devs-ueb.tech npx cap sync android
cd android
./gradlew assembleDebug
```

Resultados:

- `npm run build`: pasa.
- `npx cap sync android`: pasa.
- `npx cap doctor android`: pasa.
- `npm run types:check`: pasa.
- `npm run lint:check`: pasa.
- `npm run format:check`: pasa.
- GitHub Actions `android-apk`: pasa y genera APK debug.
- Prueba en dispositivo Android real: pendiente.
