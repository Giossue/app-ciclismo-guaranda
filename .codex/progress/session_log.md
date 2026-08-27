# Bitácora de sesiones

## 2026-06-29

- Se consolidó `README.md` como especificación del sistema híbrido Android.
- Se creó `AGENTS.md` como router de conocimiento.
- Se creó estructura `.codex/` con reglas, arquitectura, dominio, workflows, testing y frontend.
- Se agregó regla de Context7.
- Se agregó carpeta `.codex/progress/` para seguimiento entre sesiones.
- Se agregó regla de operaciones de BD remota sin persistir contraseña en el repo.
- Se crearon migraciones Laravel agrupadas por dominio para usuarios/perfil, rutas, POIs, recorridos GPS, incidencias, interacciones, offline/sync, IA y notificaciones.
- Se generaron modelos Eloquent del dominio Guaranda Go.
- Se actualizó `User` con SoftDeletes, perfil y relaciones básicas.
- Se ajustó la prueba de eliminación de cuenta para esperar deshabilitación/eliminación lógica.
- Se ajustó `composer.json` para que `types:check` ejecute PHPStan con `memory_limit=512M`.
- Se convirtió el esquema de tablas a español: `usuarios`, `rutas`, `puntos_interes`, `incidencias`, `recorridos`, etc.
- Se configuró Laravel para usar tablas españolas configurables: `sesiones`, `almacen_cache`, `bloqueos_cache`, `trabajos`, `lotes_trabajos`, `trabajos_fallidos`, `tokens_restablecimiento_contrasena`, `migraciones`.
- Se creó `App\Models\ClaveAcceso` para que Laravel Passkeys use la tabla `claves_acceso`.
- Se reconstruyó la BD remota limpiando tablas anteriores y aplicando migraciones completas.
- Se verificó que la BD remota tiene 14 migraciones registradas en `migraciones` y columnas PostGIS `geom`.
- Se creó `.codex/plans/` con planes por fase para iniciar el desarrollo funcional de la app.
- Se actualizó `AGENTS.md` para exigir lectura/actualización de planes antes de implementar fases.
- Validaciones ejecutadas y aprobadas: `composer lint`, `composer test`.
- Se implementó la fase `01_seeders_catalogos.md` con `CatalogSeeder`, `InitialAdminUserSeeder`, `config/guaranda.php` y `CatalogSeederTest`.
- Se reemplazó el usuario de prueba del `DatabaseSeeder` por seeders reales de catálogos y administrador opcional por configuración.
- Se ejecutó `composer test` y pasó completo: 40 tests, 241 assertions.
- Se aplicaron los seeders en la BD remota PostgreSQL/PostGIS con `db:seed --force` usando conexión `pgsql` remota.
- Se verificaron conteos de los 20 catálogos en la BD remota.
- Se implementó la fase `02_auth_roles_usuarios.md`.
- Se adaptó registro Fortify para exigir apellido, género, fecha de nacimiento y edad mínima de 10 años.
- Se asigna rol `ciclista` por defecto al registrarse.
- Se agregó autenticación Fortify personalizada para impedir login de usuarios inactivos o soft-deleted.
- Se agregaron middlewares `EnsureUserIsActive` y `EnsureUserIsAdmin`.
- Se agregó `UserPolicy` y panel inicial `/admin/users` para gestión de usuarios por administrador.
- Se adaptó perfil de usuario con los nuevos campos obligatorios y desactivación de cuenta mediante `active=false` + soft delete.
- Se regeneró Wayfinder y se agregó página Inertia `admin/users/index`.
- En fase 02 no se ejecutaron migraciones, seeders ni cambios contra BD remota.
- Validaciones fase 02 aprobadas: tests focalizados de auth/perfil/admin, `composer test` completo, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `03_panel_admin_base.md`.
- Se creó `AdminLayout` para páginas `admin/*` con navegación mobile first y contexto de centro de control.
- Se creó navegación admin compartida con módulos: resumen, rutas, POIs, incidencias, usuarios, valoraciones, catálogos, estadísticas y configuración.
- Se creó `DashboardController` con métricas simples y página `admin/dashboard`.
- Se creó `ModuleController` y páginas base para módulos administrativos pendientes sin adelantar CRUD específico.
- Se agregaron rutas admin base y redirección `/admin` → `/admin/dashboard`, todas protegidas por rol admin.
- Se agregó `AdminPanelBaseTest` para autorización y navegación admin.
- En fase 03 no se ejecutaron migraciones, seeders ni cambios contra BD remota.
- Validaciones fase 03 aprobadas: tests focalizados admin, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `04_rutas_admin.md`.
- Se agregaron relaciones Eloquent para rutas, geometrías, métricas, imágenes, recomendaciones y observaciones.
- Se creó `CyclingRoutePolicy` para restringir CRUD administrativo a rol administrador.
- Se implementó `Admin\RouteController` con listado, creación, edición, actualización e inactivación de rutas oficiales.
- Se agregaron `StoreRouteRequest` y `UpdateRouteRequest` con validación de catálogos, métricas, texto multilinea y GeoJSON `LineString`.
- Se agregó sincronización transaccional de ruta, geometría, métricas, imágenes, recomendaciones y observaciones.
- Se agregó actualización opcional de `geom` PostGIS solo para conexión `pgsql` con columna existente.
- Se creó `/routes` protegido por login para que ciclistas vean solo rutas con estado `activa`.
- Se agregaron páginas Inertia mobile first `admin/routes/index`, `admin/routes/create`, `admin/routes/edit` y `routes/index`.
- Se regeneró Wayfinder para los nuevos controladores y rutas.
- Se agregaron `AdminRouteManagementTest` y `CyclistRouteVisibilityTest`.
- En fase 04 no se ejecutaron migraciones, seeders ni cambios contra BD remota.
- Validaciones fase 04 aprobadas: tests focalizados, `pint`, `composer test` completo, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se actualizó la regla de operaciones de BD: cuando una fase requiera cambios de esquema/datos, se implementan y aplican en la BD remota sin pedir confirmación adicional.
- Se implementó la fase `05_mapa_visualizacion_rutas.md`.
- Se instalaron `leaflet`, `react-leaflet` y `@types/leaflet` para mapas en React/Vite.
- Se agregaron relaciones Eloquent para POIs asociados a rutas e incidencias asociadas a rutas.
- Se amplió `Cyclist\RouteController` con listado y detalle de rutas activas, incluyendo GeoJSON, métricas, recomendaciones, observaciones, POIs e incidencias en revisión.
- Se agregó ruta `/routes/{route:slug}` para detalle de ruta activa.
- Se creó componente `RouteMap` con trazado GeoJSON, puntos inicio/final, POIs, incidencias, ubicación actual y badges de conexión/GPS.
- Se actualizó `routes/index` para mostrar mapa de rutas activas y tarjetas enlazadas al detalle.
- Se creó `routes/show` para detalle mobile first de ruta.
- Se agregó `RouteMapVisualizationTest` para validar mapa/detalle/invisibilidad de rutas inactivas.
- Fase 05 no requirió migración nueva ni operación de BD remota porque el esquema existente ya cubría las necesidades.
- Validaciones fase 05 aprobadas: tests focalizados, `pint`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `06_pois.md`.
- Se completó CRUD administrativo de POIs con categorías, detalles por categoría, horarios, imágenes y asociación ruta-POI.
- Se agregaron formularios en detalle de ruta para que ciclistas sugieran POIs y reporten POIs cerrados/datos incorrectos.
- Se agregaron controladores, requests, policy y relaciones Eloquent para POIs, sugerencias, reportes, horarios, imágenes y detalles específicos.
- Se agregaron `AdminPoiManagementTest` y `CyclistPoiInteractionTest`.
- Fase 06 no requirió migración ni operación de BD remota porque el esquema existente ya cubría las necesidades.
- Validaciones fase 06 aprobadas: Wayfinder, tests focalizados, `pint`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `07_incidencias.md`.
- Se agregó reporte de incidencias desde el detalle de ruta activa con tipo, título, descripción, latitud/longitud, botón GPS y foto opcional hasta 5 MB.
- Se creó flujo backend `Cyclist\IncidentController` + `StoreIncidentRequest`; las incidencias nuevas quedan en estado `reportada`.
- Se agregó revisión administrativa en `/admin/incidents` con `Admin\IncidentController` + `UpdateIncidentRequest`.
- Se crean notificaciones internas para administradores cuando se reporta una incidencia y para el ciclista cuando se revisa.
- Se agregó `IncidentPolicy` y relaciones `Incident::files()` / `IncidentFile::incident()`.
- Se mantuvo la regla de visibilidad: solo incidencias `en revisión` se muestran a ciclistas como activas validadas.
- Fase 07 no requirió migración ni operación de BD remota porque el esquema existente ya cubría incidencias, archivos y notificaciones.
- Validaciones fase 07 aprobadas: Wayfinder, tests focalizados, `pint`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `08_recorridos_gps.md`.
- Se agregaron `Cyclist\TrackController`, `StoreTrackRequest`, `StoreTrackPointRequest` y `TrackPolicy`.
- Se agregaron relaciones `Track::user()`, `Track::route()`, `Track::status()`, `Track::gpsPoints()` y `TrackGpsPoint::track()`.
- Se conectaron rutas para iniciar recorrido, registrar puntos GPS, pausar, reanudar, finalizar, cancelar, ver resumen y exportar GPX/GeoJSON.
- Se agregó panel de recorrido en `routes/show` con registro automático de punto GPS cada 60 segundos mientras está `en curso`.
- Se agregó página `tracks/show` con resumen final, métricas, últimos puntos y enlaces de exportación.
- Se agregó `CyclistTrackLifecycleTest` para ciclo completo, autorización, métricas, validez 90% y exportación.
- Fase 08 no requirió migración ni operación de BD remota porque el esquema existente ya cubría recorridos, estados y puntos GPS.
- La prueba real Android de GPS queda planificada para Fase 12/Capacitor.
- Validaciones fase 08 aprobadas: Wayfinder, tests focalizados, `pint`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

- Se implementó la fase `09_offline_sincronizacion.md`.
- Se agregaron `OfflineRouteController`, `SyncController`, requests JSON y relaciones para `RouteDownload`/`SyncQueueEntry`.
- Se creó paquete offline de rutas activas con GeoJSON, métricas, POIs, imágenes, horarios e incidencias en revisión.
- Se agregó cola local IndexedDB (`resources/js/lib/offline`) y cliente de sincronización para incidencias y recorridos offline.
- Se integró panel offline en `routes/show` con descarga, verificación de versión, almacenamiento, cola pendiente, sync, incidencia local y recorrido offline básico.
- Se agregó `OfflineSyncTest` cubriendo paquete offline, descarga, desactualización, sync de incidencia con foto, sync de recorrido y validación JSON.
- Fase 09 no requirió migración ni operación de BD remota porque el esquema existente ya cubría las tablas de offline/sync.
- SQLite nativo Android y mapa offline empaquetado quedan registrados para Fase 12/Capacitor.
- Validaciones fase 09 aprobadas: `pint`, `OfflineSyncTest`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.
- Se implementó la fase `10_valoraciones_favoritos.md`.
- Se agregaron controladores `FavoriteRouteController`, `RouteRatingController` y `Admin\RatingController`.
- Se agregaron requests y policy para valoraciones, además de relaciones Eloquent para favoritos, valoraciones, rutas y recorridos.
- Se agregó `/favorites` y la pantalla `favorites/index` para listar y quitar rutas favoritas.
- Se actualizó `routes/index` y `routes/show` para mostrar favorita, promedio, comentarios aprobados y formulario de valoración condicionado a recorrido válido.
- Se agregó `/admin/ratings` con página `admin/ratings/index` para moderación y respuesta administrativa.
- Se agregó `FavoritesAndRatingsTest` cubriendo favoritos, requisito de recorrido válido, unicidad/edición y promedio aprobado ignorando rechazadas.
- Fase 10 no requirió migración ni operación de BD remota porque el esquema existente ya cubría las tablas de interacción.
- Validaciones fase 10 aprobadas: Wayfinder, `pint`, `FavoritesAndRatingsTest`, `composer test`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

## 2026-06-30

- Se completó la fase `11_chatbot_n8n.md`.
- Se agregó configuración `guaranda.n8n.webhook_url` y `timeout_seconds` desde variables de entorno, sin guardar ni exponer secretos.
- Se implementó `Cyclist\ChatController` como proxy backend para n8n, con persistencia de conversaciones/mensajes, contexto mínimo y extracción de texto desde respuestas JSON comunes de `Respond to Webhook`.
- Se agregó `StoreChatMessageRequest` para validar mensaje, conversación propia y ruta activa como contexto opcional.
- Se conectaron rutas `/chat`, `/chat/messages` y `/chat/conversations/{conversation}` protegidas por `auth`/`verified`, con rate limit en envío de mensajes.
- Se creó la página Inertia `chat/index` con historial, burbujas de chat, selección de ruta activa, aviso offline y bloqueo de envío si no hay conexión o webhook configurado.
- Se añadió navegación principal a rutas, favoritas y asistente IA.
- Se agregaron relaciones Eloquent `AiConversation::user/messages`, `AiMessage::conversation` y `User::aiConversations`.
- Se agregó `ChatbotN8nTest` cubriendo render seguro, proxy a n8n, no envío de email/nombre, errores del webhook, soft delete por propietario y ruta activa obligatoria.
- Fase 11 no requirió migración ni operación de BD remota porque `conversaciones_ia` y `mensajes_ia` ya existían.
- Se regeneró Wayfinder y se aplicó Prettier al frontend.
- Validaciones fase 11 aprobadas: `pint`, `ChatbotN8nTest`, `composer test` completo, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

- Se avanzó la fase 12_capacitor_android.md hasta bloqueo de entorno.
- Se instaló Capacitor 8 y plugins Android: geolocation, camera, filesystem, network, local-notifications y @capacitor-community/sqlite.
- Se creó capacitor.config.ts con app id ec.edu.ueb.guarandago, webDir capacitor-www y URL móvil opcional por GUARANDA_GO_MOBILE_SERVER_URL.
- Se creó capacitor-www/index.html como fallback estático requerido por Capacitor para un monolito Laravel/Inertia.
- Se generó el proyecto nativo android, se configuraron permisos y minSdkVersion 33 para Android 13+.
- Se agregó resources/js/lib/native/capacitor.ts para Network/GPS/cámara/filesystem/notificaciones con fallback web y se integró Network en el chat.
- npx cap sync android y npx cap doctor android pasan.
- La compilación APK quedó bloqueada: con Java 26 Gradle falla por versión incompatible; con JDK 17 avanza hasta falta de Android SDK/ADB (ANDROID_HOME o android/local.properties).
- Validaciones fase 12 aprobadas: npm run build, npm run types:check, npm run lint:check, npm run format:check; npm run cap:build:android bloqueado por falta de SDK.

- Se desbloqueó la compilación de la fase 12 mediante GitHub Actions.
- Se creó .github/workflows/android-apk.yml para generar APK debug en la nube.
- Se configuró el secret de GitHub GUARANDA_GO_MOBILE_SERVER_URL con https://ciclismo.devs-ueb.tech.
- Tras corregir el setup de Android SDK, instalar dependencias PHP para Wayfinder y usar Java 21, el workflow android-apk pasó correctamente.
- GitHub Actions generó el artifact guaranda-go-debug-apk con app-debug.apk.
- La fase 12 cambió de Bloqueado a Requiere revisión porque falta instalar/probar el APK en Android 13+.

- Se agregó configuración Docker para desplegar Laravel/Inertia en Dokploy: Dockerfile, .dockerignore, Nginx, Supervisor y entrypoint con migraciones/seeders/cache al iniciar.
- Se verificó deploy Dokploy con HTTP 200 en https://ciclismo.devs-ueb.tech y se ajustó TrustProxies para evitar URLs http en assets preloaded.
- Se corrigió navegación principal: sidebar sin Dashboard starter, links por rol, padding global consistente y landing Guaranda Go en lugar de welcome Laravel.
- Se corrigió bug de Leaflet sobre overlays aislando el mapa y elevando Sheet; se agregó bottom navbar móvil con menú Más.

- Se completó la fase `13_estadisticas_reportes.md` con módulos administrativos reales para catálogos, estadísticas y configuración.
- Se eliminó el controlador/página placeholder de módulos administrativos y el componente visual `placeholder-pattern` restante del starter.
- Se agregó `/admin/catalogs` para crear/actualizar catálogos base del sistema desde UI admin.
- Se agregó `/admin/statistics` con métricas, rankings, filtros por fecha, registro de consultas de rutas y exportación CSV.
- Se agregó `/admin/settings` para ver estado operativo de Laravel/Dokploy/PostGIS/n8n/storage/despliegue sin exponer secretos.
- Se ajustó el deploy Docker para no ejecutar seeders por defecto; solo corre seeders si `RUN_SEEDERS=true`.
- Se actualizó el checklist de aceptación con administración sin placeholders, despliegue web y validación Android.
- La fase `14_validacion_final.md` queda en `Requiere revisión`: validación local completa aprobada, pero falta prueba física del APK en Android 13+.
- Validaciones aprobadas: `vendor/bin/pint --dirty --format agent`, `php artisan test --compact` (131 tests, 754 assertions), `npm run lint:check`, `npm run types:check`, `npm run format:check`, `npm run build` y `php artisan route:cache --no-interaction`.

- Se actualizó AGENTS.md, .codex/rules/database_operations.md y .codex/rules/project_rules.md para dejar obligatoria la regla: producción sin seeders automáticos; datos reales directos en BD; schema por migraciones; deploy normal sin seeders.

- Se agregó workflow para crear GitHub Releases automáticas con APK release firmada cuando , y pasan en .
- Se configuró para leer firma y versión Android desde variables de entorno del CI.
- Se activó ignore de y en para evitar subir keystores al repositorio.

- Se agregó workflow de release APK para crear GitHub Releases automáticas con APK release firmada cuando tests, linter y android-apk pasan en main.
- Se configuró Android Gradle para leer firma y versión Android desde variables de entorno del CI.
- Se activó ignore de archivos jks y keystore para evitar subir keystores al repositorio.

- Se corrigió el botón Cerrar sesión del menú para usar rojo explícito bg-red-600 con texto blanco, evitando que dependa del token destructivo del tema.
- Se corrigió el fallo de android-apk / Build web assets: se eliminó laravel-vite-plugin/fonts de Vite para evitar fetch remoto a Bunny Fonts en CI.
- Validaciones aprobadas tras la corrección: npm run format:check, npm run types:check, npm run lint:check y npm run build.

- Se eliminó del welcome/login público el bloque de tarjetas informativas Rutas cicloturísticas, Recorridos GPS y Modo híbrido Android.
- Se analizó feedback de testers contra el código actual: creación de rutas, mapa, POIs, registro, contraseña, portadas y asistente IA.
- Validaciones aprobadas: npm run format:check, npm run types:check, npm run lint:check y npm run build.

- Se implementó paquete bugfix de feedback de testers en con 8 archivos de seguimiento.
- Se eliminó el bloque de tarjetas informativas del welcome/login público.
- Se agregó creación/edición de rutas con mapa Leaflet.draw, geocoder OSM/Nominatim, cálculo de distancia y derivación automática de inicio/final.
- Se agregó subida de imagen principal y galería de rutas con límite de 5 MB por imagen, y portadas en listado/detalle.
- Se cambió experiencia requerida a selección múltiple guiada y se agregó selección de POIs activos desde el formulario de ruta.
- Se mejoró el mapa de ciclista con navegación externa hacia el inicio, conexión referencial y popups con imágenes/descripción.
- Se agregó checklist visual de contraseña en registro antes de enviar.
- Se agregó migración 2026_06_30_000015_create_route_rating_files_table.php y modelo RouteRatingFile para fotos/videos de experiencias en valoraciones, hasta 4 archivos de 20 MB.
- Se confirmó que n8n no se corrige como bug porque el flujo aún no existe; queda pendiente de configuración externa.
- Validaciones aprobadas: Pint dirty, tests focalizados AdminRouteManagementTest/FavoritesAndRatingsTest/RouteMapVisualizationTest, php artisan test --compact, npm format:check, npm types:check, npm lint:check, npm build, composer types:check y php artisan route:cache.

- Se completó la tarea de traducción del sistema a español en auth, ajustes, seguridad, passkeys, 2FA, flashes backend y mensajes base de Laravel.
- Se agregó `.codex/bugfix/09-traduccion-espanol.md` como seguimiento de la corrección.
- Se cambió el locale por defecto de Laravel a `es`, fallback `es` y faker `es_EC`; se agregaron `lang/es.json`, `lang/es/auth.php`, `lang/es/passwords.php` y `lang/es/validation.php`.
- Se ejecutó el escáner `temp/scan_english_ui.py`; los restos reportados son falsos positivos de clases CSS, identificadores o acrónimos técnicos como `APP_KEY`, `APP_URL HTTPS` y `route_id`.
- Validaciones aprobadas: `npm run format`, `npm run format:check`, `npm run types:check`, `npm run lint:check`, `npm run build`, `vendor/bin/pint --dirty --format agent`, `php artisan test --compact` (133 tests, 765 assertions), `composer types:check` y `php artisan route:cache --no-interaction`.

- Se ajustó el catálogo de género para permitir solo `masculino` y `femenino`.
- La UI de registro/perfil/admin ahora recibe solo opciones `Masculino` y `Femenino`; cualquier `gender_id` asociado a otros catálogos queda rechazado por validación.
- El panel de catálogos oculta géneros no permitidos y no permite crear valores fuera de masculino/femenino para `Géneros`.
- Se actualizó `CatalogSeeder`, pruebas y documentación del modelo de datos para eliminar `otro` y `prefiero no decir` como géneros.
- Validaciones aprobadas: `pint --dirty`, tests focalizados de registro/usuarios/catálogos/perfil, `php artisan test --compact` (134 tests, 766 assertions), `composer types:check` y `php artisan route:cache`.

- Se aplicó limpieza directa en la BD remota PostgreSQL/PostGIS del catálogo `generos`: se eliminaron `otro` y `prefiero no decir`; quedaron solo `masculino` y `femenino`.
- Verificación posterior en BD remota: `generos` contiene 2 filas y existe 1 usuario con `gender_id` nulo por haber quedado sin una opción válida tras la limpieza.

- Se actualizó directo en la BD remota el usuario `Administrador Guaranda Go` (`admin@email.com`) para asignarle género `masculino`; verificación posterior: 0 usuarios con `gender_id` nulo.

- Se agregaron planes de bugfix 14-18 en `.codex/bugfix/` para nuevos feedbacks: editor avanzado de rutas admin, POIs con mapa/imágenes/detalles por categoría, navegación de catálogos por select, mapa cicloturístico con filtros/GPS/inicio restringido y bienvenida con nombre completo.

- Se implementó primer bloque de bugfix pendientes: mapa cicloturístico con filtros y satélite, eliminación de línea recta GPS→inicio, bloqueo de inicio de recorrido lejos del punto inicial, ubicación actual en editor admin, preview de imágenes de rutas, navegación de catálogos por select, mejoras POI con placeholders/categoría dinámica/imágenes, sugerencia POI mediante mapa y bienvenida con nombre completo.
- Validaciones aprobadas: Pint dirty, tests focalizados Route/Track/Poi/Catalog, suite completa `php artisan test --compact` (135 tests, 769 assertions), `npm run types:check`, `npm run lint:check`, `npm run format:check`, `npm run build`, `composer types:check` y `php artisan route:cache`.

- Se recomendó OpenTopoData como proveedor open source de elevación, idealmente self-hosted o consumido vía proxy backend Laravel para no depender del frontend/APK ni exponer servicios.
- Se reemplazó la asociación POI-ruta en administración por UI estructurada de rutas, obligatorio, km desde inicio y observación, manteniendo compatibilidad con el backend mediante `route_links_text` oculto.
- Se completó refactor visual mobile first inspirado en los bocetos verdes/redondeados: tema global, cards, botones, inputs/selects, navbar inferior, header, mapa, rutas, detalle de ruta, chat y menú; no se cambió lógica ni orden funcional de componentes.
- Validaciones aprobadas tras el refactor visual: `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

- Se integró OpenTopoData para cálculo de desnivel desde el editor admin de rutas mediante proxy backend Laravel (`admin.routes.elevation-preview`), sin llamadas directas desde frontend/APK.
- Se agregó configuración `guaranda.elevation.opentopodata` con variables `GUARANDA_GO_OPENTOPO_BASE_URL`, `GUARANDA_GO_OPENTOPO_DATASET`, `GUARANDA_GO_OPENTOPO_INTERPOLATION`, `GUARANDA_GO_OPENTOPO_TIMEOUT_SECONDS` y `GUARANDA_GO_OPENTOPO_MAX_SAMPLES`.
- Se corrigió el enfoque del chat n8n: Laravel ya no crea conversaciones ni mensajes al enviar; solo envía `session_id`, mensaje y contexto mínimo al webhook. Las tablas `conversaciones_ia` y `mensajes_ia` quedan intactas para compatibilidad/legado.
- Validaciones aprobadas: Pint dirty, pruebas focalizadas `ChatbotN8n|AdminRouteManagement`, suite completa `php artisan test --compact` (136 tests, 771 assertions), `composer types:check`, `npm run types:check`, `npm run lint:check`, `npm run format:check`, `npm run build` y `php artisan route:cache`.

- Se reemplazó el refactor verde/redondeado por una dirección flat mobile-first: radios moderados, sin degradados globales y sin sombras decorativas.
- Se agregó `MobileTabs` para dividir pantallas largas sin cambiar URL ni ensuciar el historial: rutas/lista-mapa, detalle de ruta, chat e historial, y resumen de recorrido.
- Se reorganizó el detalle de ruta en tabs: Mapa, Ruta, POIs, Reportar, Opiniones y Sin conexión, evitando que mapa, comentarios, reportes y offline queden apilados en una sola pantalla larga.
- Se separó el historial del chat en un tab propio y se eliminaron menciones visibles a n8n/Laravel/webhook/proxy para usuario final.
- Se cambiaron textos visibles de usuario final para evitar lenguaje administrativo como “comentarios aprobados”, “revisión administrativa” o detalles de implementación.
- Se compactaron rutas, favoritas, menú, resumen de recorrido, bottom nav y controles base con estilo plano.
- Validaciones aprobadas: `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

- Se agregó `@capacitor/app` para manejar correctamente el botón atrás nativo de Android con `backButton`: vuelve en historial cuando existe, regresa a `/routes` o `/admin/dashboard` como fallback y solo sale en la pantalla raíz.
- Se ejecutó `npm run cap:sync:android` para registrar el plugin nativo en Android; el sync encontró 7 plugins incluyendo `@capacitor/app@8.1.0`.

- Se corrigió `MobileTabs` para usar segmented control unido y centrado, sin badges/contadores visuales en los tabs, según referencia indicada por el usuario.
- Validaciones aprobadas tras la corrección: `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

- Se inició Fase 15 `15_agente_n8n_tools.md` para agente n8n sin embeddings y con datos vivos desde Laravel.
- Se crearon tools API protegidas por token: búsqueda de rutas, detalle de ruta, alertas de ruta, búsqueda de POIs y progreso/distancia restante.
- Se agregó middleware `EnsureAgentToolToken`, ruta `routes/api.php`, carga de API en `bootstrap/app.php` y configuración `guaranda.agent.tool_token` (`GUARANDA_GO_AGENT_TOOL_TOKEN`).
- Las tools exponen solo rutas activas, POIs activos y alertas visibles para ciclistas; no se agregaron tablas ni se modificó persistencia de conversaciones IA.
- Se agregó `AgentToolsTest` con cobertura de token, rutas cercanas, detalle, POIs, progreso y alertas.
- Validaciones aprobadas: `pint --dirty`, `AgentToolsTest` (6 tests, 45 assertions), `composer types:check`, suite completa `php artisan test --compact` (142 tests, 816 assertions) y `php artisan route:cache --no-interaction`.

## 2026-07-01 — Chat IA historial y GPS

- Se reactivó el historial local usando `conversaciones_ia` y `mensajes_ia`, guardando solo después de recibir respuesta del workflow n8n.
- Se agregó continuidad de conversaciones desde el tab Historial mediante `conversation_id`.
- Se agregó trazado visual del recorrido GPS activo en el mapa de detalle de ruta.
- Validación: `ChatbotN8nTest`, `CyclistTrackLifecycleTest`, `npm run types:check`, `composer types:check`, `pint --dirty`, `diff --check`.

## 2026-07-01 — Ajustes UI móvil y storage

- Chat rediseñado como conversación móvil con historial en sheet lateral derecho.
- Rutas/Favoritas/Menu simplificados para evitar accesos duplicados con barra inferior.
- Confirmado que las imágenes usan el disk `public` en `storage/app/public` y requieren volumen persistente en Dokploy.
- Validación: `npm run types:check`, `npm run lint:check`, `npm run format:check`, `ChatbotN8nTest`.

## 2026-07-01 — POIs desde ruta con mapa interactivo

- El formulario admin de rutas ahora permite crear puntos de interés propios de la ruta desde la misma pantalla.
- La ubicación de cada POI se marca tocando el mapa, no escribiendo coordenadas manualmente.
- Los POIs creados se guardan en `puntos_interes` y se vinculan en `ruta_punto_interes`.
- Validación: `AdminRouteManagementTest`, `composer types:check`, `npm run types:check`, `npm run lint:check`, `npm run format:check`.

## 2026-07-01 - Plan refactor frontend mobile first

- Se analizó la estructura actual del frontend con `temp/analyze_frontend.py`.
- Se identificaron 32 pantallas Inertia y componentes base bajo `resources/js/components`, `resources/js/layouts` y `resources/js/pages`.
- Se creó proyecto Stitch `projects/6540137781896183848` y design system `assets/8743915527678384604`.
- Se creó el plan `.codex/plans/16_refactor_frontend_mobile_design.md`.
- No se modificó código funcional; validación no ejecutada por ser solo análisis y documentación de plan.

## 2026-07-01 - Refactor frontend mobile first implementado

- Se aplicó el sistema visual Andean Field UI en tokens globales, shadcn/ui base, layouts, bottom nav, auth, welcome, settings, mapas y pantallas admin/ciclista mediante barrido de clases.
- Toasts `sonner` quedan bottom-center con offset sobre bottom nav y avisos online/offline.
- Se eliminaron colores Tailwind hardcodeados detectados por scanner; mapas usan tokens CSS.
- Validación: `npm --prefix ciclismo-guaranda run types:check`, `lint:check`, `format:check` y `build` pasan.

- Se reemplazó la dirección visual previa por clon visual del repositorio `ciclismo-ueb` (Angular) adaptado a Laravel/Inertia/React/shadcn, sin copiar lógica.
- Se mantuvo el icono original de la aplicación (`/logo.svg`) y se evitó sobrescribir `AppLogoIcon` con `ciclotour.svg`.
- Se portaron tokens dark/lime, fuente `CicloSans`, bottom nav plana, auth con montañas, cards de rutas compactas y chat tipo mensajería móvil.
- Se mantuvieron intactos backend, BD, rutas URL, nombres de campos y flujos de formularios.
- Validaciones aprobadas: `npm --prefix ciclismo-guaranda run format`, `npm --prefix ciclismo-guaranda run format:check`, `npm --prefix ciclismo-guaranda run types:check`, `npm --prefix ciclismo-guaranda run lint:check` y `npm --prefix ciclismo-guaranda run build`.

- Se corrigió la UI del asistente: botón visible para nueva conversación, acciones para ocultar conversación activa o desde historial, y renderizado local básico de Markdown (`**negrita**`, párrafos y listas) sin depender de n8n ni agregar paquetes.
- Se confirmó que ocultar conversación usa el endpoint existente con `SoftDeletes`: se quita del historial del usuario sin borrado físico de `conversaciones_ia`.
- Validaciones aprobadas: `ChatbotN8nTest`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y `npm run build`.

## 2026-07-01 — Notificaciones internas

- Se analizó la BD/migraciones y se confirmó que `notificaciones_app` ya existía con `user_id`, `type`, `title`, `message`, `read`, `read_at` y timestamps; no se agregó migración.
- Se implementó `/notifications` para listar notificaciones propias, filtrar no leídas y marcarlas como leídas individualmente o todas, sin opción de eliminar.
- Se agregó campana global en header/sidebar header con contador de no leídas; también se habilitó header móvil con campana, acceso en menú de usuario y navegación móvil.
- Se agregaron relación `User::appNotifications()` y `AppNotification::user()`, contador compartido por Inertia y tests `AppNotificationsTest`.
- Validaciones aprobadas: `AppNotificationsTest`, `AdminIncidentReviewTest`, `FavoritesAndRatingsTest`, `pint --dirty`, `npm run types:check`, `npm run lint:check`, `npm run format:check`, `composer types:check`, `npm run build` y `php artisan route:cache --no-interaction`.

## 2026-07-01 — Padding/margin consistente y despeje de navbar móvil

- Diagnóstico: en `app-sidebar-layout.tsx` el `<main>` usaba `w-full` (utilidad) que pisaba el `width` de `.ueb-admin-page` (capa components) → contenido en el filo en todas las páginas sin `.ueb-page` propio (tracks, favorites, notifications, menu, admin, settings, routes/show).
- Además `py-[var(--page-pad-y)]` pisaba el `padding-bottom` de `.safe-bottom-pad`, dejando el contenido bajo la navbar móvil fija (72px).
- Fix centralizado en `app-sidebar-layout.tsx`: se quitó `w-full` y `md:px-0`; se reemplazó `py` por `pt-[var(--page-pad-y)]` + `md:pb-[var(--page-pad-y)]` para que `.safe-bottom-pad` despeje la nav en móvil (~92px) sin gap excesivo en desktop.
- CSS `.ueb-page`: se pasó de `width: min(calc(...))` a `width:100%` + `max-width:var(--page-max-tablet)` + `margin-inline:auto`, evitando doble padding en rutas/chat y unificando el margen lateral en todas las vistas.
- CSS `.ueb-chat-shell`: se reemplazó `height: calc(100dvh - nav - safe)` por `flex: 1 1 0%` para que el chat llene el `<main>` y su footer quede sobre la navbar en vez de tras ella.
- Validaciones aprobadas: `npm run types:check`, `npm run lint:check`, `npm run format:check`, `npm run build`.

## 2026-07-01 — Navbar, header, sombras/degradados, modo claro y tabs centrados

- Navbar móvil: se quitó el ítem "Notificaciones" y se restauró "Favoritas" en `mobilePrimaryNavItems` (ciclista). El acceso a notificaciones queda solo en la campana del header.
- Header: se quitó el título/breadcrumb duplicado en `AppSidebarHeader`; ahora muestra solo la marca "Guaranda Go" + campana. Se ajustó la cadena de props (breadcrumbs ya no se pasan al header).
- Sombras: regla global `*::before,*::after { box-shadow: none !important }` en `@layer base` para neutralizar todas las sombras (cards, botones, navs, diálogos, etc.). Se quitó el `drop-shadow` del logo de auth.
- Degradados: se eliminó el radial-gradient del body, el linear-gradient de `.ueb-route-thumb` (ahora `var(--panel-soft)`) y el degradado del card destacado de `welcome.tsx` (ahora verde sólido `#2f7d00`).
- Modo claro: el tema estaba definido en `:root, .dark` (misma paleta oscura) por lo que el modo claro era idéntico al oscuro. Se separó en `:root` (paleta clara: fondos claros, texto oscuro, primario verde `#3f6b0a`) y `.dark` (paleta oscura con lime `#b2f000`). Se quitó `color-scheme: dark` hardcodeado (lo controla el hook use-appearance).
- Tabs centrados: `MobileTabs` ahora centra la fila de tabs (`mx-auto`) y `SettingsLayout` centra su nav (`justify-center` / `lg:justify-start`), eliminando el espacio al final en ajustes.
- Validaciones aprobadas: `npm run types:check`, `npm run lint:check`, `npm run format:check`, `npm run build`.

## 2026-07-01 — Ubicación transitoria para chat y fallback de rutas

- `buscar_rutas` ahora reintenta sin `query` cuando una consulta genérica no encuentra rutas, devolviendo rutas activas generales en vez de vacío.
- El chat permite activar ubicación desde la UI y envía `location.latitude`, `location.longitude`, `location.accuracy_m` y `location.recorded_at` al webhook n8n como dato transitorio.
- Laravel valida la ubicación recibida y no la guarda en el contexto persistido de `conversaciones_ia`/`mensajes_ia`.
- Validaciones aprobadas: `composer lint`, `AgentToolsTest`, `ChatbotN8nTest`, `composer types:check`, `npm run types:check`, `npm run lint:check` y `npm run format:check`.

## 2026-07-01 — Ubicación compartida entre mapa y chat

- La ubicación obtenida desde el mapa ahora se recuerda de forma transitoria en `sessionStorage` durante 15 minutos.
- El chat carga automáticamente esa última ubicación si está vigente, para que las consultas de cercanía no pidan activar ubicación de nuevo.
- El botón de ubicación del chat sigue permitiendo actualizar la posición manualmente.
- Validaciones aprobadas: `npm run types:check`, `npm run lint:check`, `npm run format:check`.

## 2026-07-01

- Se ajustó el layout autenticado para aplicar padding lateral global y evitar contenido pegado al borde en móvil.
- Se rediseñó la pantalla del asistente IA para verse como chat integrado, sin contenedor tipo card en el shell principal.
- Se cambió el avatar del mensaje del usuario para usar la inicial real del nombre autenticado.
- Se eliminó el toast de éxito al recibir respuestas normales del asistente.
- Se mantuvieron los toasts/errores para acciones no relacionadas y fallos del asistente.

## 2026-07-01 — limpieza BD IA

- Se eliminaron directamente en la BD PostgreSQL remota los registros de historial del asistente IA.
- Tablas afectadas: `mensajes_ia` y `conversaciones_ia`.
- Conteo antes: 84 mensajes y 17 conversaciones.
- Conteo después: 0 mensajes y 0 conversaciones.
- No se usaron seeders ni se modificó esquema.

## 2026-07-01 — eliminación tabla memoria n8n

- Se eliminó en la BD PostgreSQL remota la tabla externa `n8n_chat_histories` usada por la memoria del agente n8n.
- Conteo antes de eliminar: 116 registros.
- Verificación posterior: la tabla ya no existe en el esquema `public`.
- No se modificaron tablas Laravel ni migraciones.

## 2026-07-01 — ajustes welcome y menú

- Se actualizó el menú móvil para mostrar nombre y apellido del usuario autenticado.
- Se simplificó la pantalla welcome eliminando la card promocional grande, sus badges Android/Mobile First y el botón secundario Ver rutas.
- Se cambió el texto de la característica IA de `n8n` a `Agente`.

## 2026-07-01

- Se corrigió el registro de cuentas: placeholder visible para fecha de nacimiento, eliminación del aviso de revisión de contraseña filtrada y mínimo visual de contraseña a 8 caracteres.
- Se ajustó la validación backend global de contraseñas a mínimo 8 caracteres en todos los entornos, manteniendo reglas fuertes adicionales en producción.
- Se agregó prueba feature para rechazar contraseñas menores a 8 caracteres.
- Validaciones aprobadas: Pint dirty check, `RegistrationTest`, `npm run lint:check` y `npm run types:check`.

## 2026-07-01 — session_id en tablas IA existentes

- Se agregó `session_id` nullable a las tablas existentes `conversaciones_ia` y `mensajes_ia` en PostgreSQL remoto para evitar el error de n8n por columna inexistente.
- Se agregó migración Laravel `2026_07_01_204600_add_session_id_to_ai_chat_tables.php` para versionar el cambio de esquema.
- Se actualizó `ChatController` para guardar `session_id` en conversaciones y mensajes IA persistidos por Laravel.
- No se creó una nueva tabla de memoria n8n.
- Se centraron los tabs segmentados en rutas, se aplicó el mismo patrón visual centrado en notificaciones y se simplificó el estado vacío de notificaciones quitando la card blanca.
- Validaciones aprobadas: `npm run format`, `npm run types:check` y `npm run lint:check`.
- Se definió una jerarquía tipográfica de 4 tamaños visibles: caption 12px, body 14px, emphasis 16px y title 22px; se mapearon utilidades Tailwind y tamaños arbitrarios pequeños a esos tokens.
- No se ejecutaron pruebas ni build por instrucción del usuario.

## 2026-07-01 — restauración memoria n8n separada

- Se recreó en PostgreSQL remoto la tabla `n8n_chat_histories` con columnas `id`, `session_id` y `message jsonb` para memoria interna de n8n.
- Se removieron de la BD remota las columnas temporales `session_id` agregadas a `conversaciones_ia` y `mensajes_ia`, dejando esas tablas solo para historial Laravel.
- Se eliminó la migración temporal de `session_id` en tablas IA y se revirtió `ChatController` para no escribir esa columna.
- Se actualizó `.codex/project/n8n_workflow.md` para que el nodo de memoria apunte a `n8n_chat_histories`.

## 2026-07-01 — limpieza migración temporal IA

- Se eliminó de la tabla `migraciones` el registro temporal `2026_07_01_204600_add_session_id_to_ai_chat_tables` porque el cambio fue revertido y la memoria n8n quedó separada en `n8n_chat_histories`.

## 2026-07-01 — payload mínimo para webhook IA

- Se redujo el payload enviado por Laravel al webhook n8n: se removieron `user_id`, `language`, `privacy`, `user.role`, `user.id`, `offline_available` y `context` innecesario.
- El webhook recibe ahora solo `session_id`, `message`, y opcionalmente `route_id`, `route` y `location`.
- Se actualizó `ChatbotN8nTest` para validar el payload reducido.
- Se actualizó `.codex/project/n8n_workflow.md` para que `Normalizar entrada` lea `body.route` y el prompt del agente use la ruta top-level.

## 2026-07-01 — memoria n8n en tabla existente

- Se eliminó la tabla separada `n8n_chat_histories` en PostgreSQL remoto.
- Se adaptó la tabla existente `conversaciones_ia` para memoria n8n agregando `session_id` y `message jsonb`, y permitiendo filas sin `user_id`.
- Se mantuvo `mensajes_ia` sin cambios para el historial visible de mensajes Laravel.
- Se creó la migración `2026_07_01_211500_make_ai_conversations_compatible_with_n8n_memory.php` y se registró/aplicó en la BD remota.
- Se actualizó `.codex/project/n8n_workflow.md` para que el nodo Postgres Chat Memory use `conversaciones_ia`.

## 2026-07-01 — consolidación endpoints API y tools n8n

- Se agregaron endpoints consolidados `POST /api/agent/routes` y `POST /api/agent/pois` que reemplazan a `buscar_rutas`, `detalle_ruta`, `alertas_ruta` y `buscar_pois`.
- `/api/agent/routes` resuelve listar, recomendar, buscar, detalle de ruta seleccionada y alertas en una sola respuesta con estructura fija.
- `/api/agent/pois` busca POIs con resumen incluido.
- Se mantienen los endpoints viejos por compatibilidad mientras se migra el workflow vivo.
- Se actualizaron pruebas `AgentToolsTest` con 3 tests nuevos para los endpoints consolidados.
- Se actualizó `.codex/project/n8n_workflow.md` reduciendo tools de 6 a 4: `rutas`, `pois`, `progreso_ruta`, `clima`.
- Se eliminaron nodos `detalle_ruta` y `alertas_ruta` del workflow documentado.
- Se actualizó prompt del agente para reflejar solo 4 tools.

## 2026-07-02 — consolidación de tools rutas+POIs y JSON limpio para el agente

- Se fusionó la tool `pois` dentro de la tool `rutas` (via `intent: "pois"`). El sistema quedó con exactamente 3 tools: `rutas`, `progreso_ruta`, `clima`.
- Se reescribió `AgentToolController` en un solo método `routes()` que resuelve list/recommend/search/detail/alerts/pois según los parámetros recibidos.
- Se agregó al JSON de la tool `rutas`: observaciones de cada POI (`puntos_interes.observations`), y resumen de valoraciones aprobadas de la ruta (`rating.average`, `rating.total`, `reviews[]` con las últimas 3 opiniones).
- Se decidió NO exponer `reportes_punto_interes` al agente porque no tiene un estado de moderación equivalente a "revisado/visible" (solo `pendiente` por defecto), a diferencia de incidencias de ruta que sí tienen `en revisión`.
- Se eliminaron del JSON de salida campos pensados para tarjetas UI que no aportaban al agente: `geojson`, `image_url`, `href`, `type`, `subtitle`, `meta`, y el objeto `route` anidado duplicado.
- Se eliminaron los endpoints legacy `/api/agent/routes/search`, `/api/agent/routes/{route}`, `/api/agent/routes/{route}/alerts`, `/api/agent/pois/search`. Quedan solo `POST /api/agent/routes` y `POST /api/agent/navigation/progress`.
- Se reescribió `tests/Feature/AgentToolsTest.php` con pruebas para el endpoint consolidado, incluyendo observaciones de POI, valoraciones aprobadas/pendientes y búsqueda de POIs independiente.
- Se actualizó `.codex/project/n8n_workflow.md`: se eliminó el nodo `pois`, se actualizó `rutas` con parámetro `poi_category` e `intent: pois`, y se simplificó el system prompt del agente a 3 tools.
- Se actualizaron `.codex/domain/chatbot_ia.md` y `.codex/architecture/n8n_webhook_agent.md` con el diseño final.
- Validaciones aprobadas: `composer exec -- php artisan test --compact` (150 tests, 898 assertions), `composer types:check`, `composer lint`.

## 2026-08-27 — Migración de tokens semánticos

- Se eliminó la capa de aliases visuales legacy (`--bg-color`, `--input-border`, `--primary-color`, etc.) y se consolidó la paleta en los tokens semánticos de shadcn/Tailwind en `resources/css/app.css`.
- Las pantallas y componentes React usan ahora clases semánticas (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, etc.); no quedan colores hardcodeados en la UI.
- Se conservaron tokens de estado y propósito (`primary-hover`, `primary-glow`, `shadow`, `overlay`, `map-background` y `brand-accent`) para los casos que no encajan en el set base de shadcn.

## 2026-08-27 — Actualización de contexto de ingeniería

- Se revisó la versión actual de `Elvis-WDev/ExpressJS-agent-context` y se incorporaron sus prácticas útiles adaptadas a Laravel 13, React/Inertia, Capacitor, PostgreSQL/PostGIS y n8n.
- Se crearon `ARCHITECTURE.md`, `CLAUDE.md`, instrucciones GitHub Copilot y `docs/` con arquitectura, producto, calidad, seguridad, planes y plantillas de especificación/ADR.
- Se añadieron skills locales de implementación, migraciones, frontend operativo, hardening, rendimiento, revisión, documentación y commits.
- Se actualizaron `AGENTS.md` y `.codex/README.md` para establecer una sola ruta de lectura y evitar duplicación entre `docs/` y `.codex/`.

## 2026-08-27 — Context7 y shadcn/ui

- Se reforzó el contexto transversal para exigir Context7 al verificar documentación de librerías externas y Laravel Boost para paquetes Laravel instalados.
- Se documentó el flujo shadcn/ui: skill + contexto del proyecto + documentación del componente + inspección de diff antes de agregar/actualizar, manteniendo tokens, accesibilidad y componentes existentes.

## 2026-08-27 — Centralización visual

- Se creó `temp/audit_ui_tokens.py` y se usó para inventariar 124 archivos de UI antes del refactor; queda documentado y reutilizable en `temp/README.md`.
- Se centralizaron radios, alturas y elevaciones en `resources/css/app.css`; botones, cards, inputs, badges, alertas, diálogos, selects, toggles, skeletons, toasts, navegación y mapa consumen esos tokens.
- Se verificaron las APIs/componentes shadcn instalados con su CLI antes de modificar sus primitives.
- Validaciones aprobadas: Prettier y ESLint focalizados, `python3 -m py_compile` y `npm run build`.

## 2026-08-27 — Tipografía del sistema

- Se reemplazó CicloSans por una pila tipográfica nativa: San Francisco para iOS/macOS, Segoe UI para Windows, Roboto para Android y fallbacks estándar.
- Se retiraron las declaraciones `@font-face` y los preloads de CicloSans; no se descargan ni requieren fuentes instaladas manualmente.

## 2026-08-27 — Boneyard

- Se instaló `boneyard-js` y se centralizaron sus defaults visuales y registro en la entrada React.
- La primera integración como overlay global de visitas Inertia se retiró: generaba huesos de páginas completas y era inapropiada para autenticación.
- La captura automática se reserva para componentes nombrados que dispongan de una ruta o fixture de desarrollo; no se deja un watcher global porque Laravel/Inertia no entrega una superficie de datos válida en cada navegación y el crawler recorrería formularios. Boneyard queda reservado para datos con estado `loading` real o Suspense.

## 2026-08-27 — Radio visual y auth shadcn

- Se redujeron 30 % los radios globales no circulares, afectando de forma uniforme controles, cards, overlays, navegación y mapas.
- Se inspeccionaron mediante el CLI los bloques `login-01` y `signup-03`; se aplicó su composición a login/registro sin sobrescribir las primitives shadcn modificadas ni alterar el contrato Fortify.

## 2026-08-27 — GitHub Actions manual y Dokploy automático

- Se desactivaron los disparadores automáticos de `android-apk`, `tests` y `linter`; los tres workflows quedan disponibles solo desde la pestaña Actions mediante `workflow_dispatch`.
- Dokploy conserva su autodespliegue nativo al recibir el push, sin esperar checks de GitHub Actions ni requerir cambios en su webhook.

## 2026-08-27 — DatePicker shadcn y PostgreSQL local

- Se reemplazaron los cinco campos `input[type="date"]` por un DatePicker reutilizable con `Calendar` y `Popover` de shadcn, localizado en español y compatible con los valores ISO del backend.
- Se añadieron `react-day-picker`, `date-fns` y el primitive de Popover Radix; no se sobrescribieron las primitives shadcn ya personalizadas.
- Se creó PostgreSQL de desarrollo en Podman, se actualizaron solo las variables DB de `.env`, se aplicaron 16 migraciones y se ejecutó exclusivamente `CatalogSeeder`.
- Validaciones aprobadas: `npm run types:check`, ESLint focalizado, `npm run build`, captura Boneyard de registro y petición local `GET /register` con HTTP 200.

## 2026-08-27 — Skeletons de autenticación

- Login, registro, recuperación, confirmación, reset y 2FA no usan Boneyard; conservan sus estados pendientes de formulario y se muestran de inmediato.

## 2026-08-27 — Rotación de acceso PostgreSQL remoto

- Se confirmó que `guaranda_go_db` existe en el clúster remoto y que `guaranda_go_app` es su rol de aplicación sin privilegios de superusuario.
- Se rotó su contraseña y se verificó una conexión nueva con dicho rol. La credencial se guarda únicamente en `.pgpass` local; no se registró en el repositorio ni en documentación.

## 2026-08-27 — Landing adaptable

- Se consultó el MCP de 21st.dev y se adaptó la referencia `Feature Bento` a la landing existente.
- La página ahora usa composición hero + bento en escritorio y una sola columna en móvil, conservando el flujo Fortify, Wayfinder, tokens semánticos y sin añadir dependencias.
- Se validó visualmente en 1440 px y 390 px, además de TypeScript, ESLint focalizado, Prettier, build y diff limpio.

## 2026-08-27 — Auth adaptable en escritorio

- Se hizo responsivo `AuthClassicLayout`: móvil permanece compacto y login/registro aprovechan el ancho disponible desde `lg`.
- Registro usa una cuadrícula de dos columnas únicamente en escritorio para pares de datos relacionados; correo, checklist y acción conservan ancho completo para legibilidad y validación de Fortify.
