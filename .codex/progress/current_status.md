# Estado actual

Fecha: 2026-06-30

## Resumen

- Proyecto Laravel inicializado en `ciclismo-guaranda/` con React starter kit, auth integrada, Pest, Laravel Boost, Wayfinder, Tailwind v4 y shadcn/ui.
- Producto definido como app híbrida Android con Capacitor, no PWA pura.
- Knowledge base `.codex` creada.
- Fase 2 completada: migraciones y modelos Eloquent del dominio Guaranda Go creados, validados y aplicados en la BD remota.
- Se cambió el esquema para que las tablas del sistema estén en español.
- Se reconstruyó la BD remota con tablas en español y tabla de control `migraciones`.
- La BD remota mantiene `spatial_ref_sys`, tabla interna de PostGIS que no debe renombrarse.
- La BD remota tiene columnas `geom` en `geometrias_ruta`, `puntos_interes`, `puntos_gps_recorrido` e `incidencias`.
- Se creó `.codex/plans/` con planes de implementación por fase.
- Fase 01 completada: seeders idempotentes de catálogos iniciales creados, validados y aplicados en la BD remota PostgreSQL/PostGIS.
- El seeder de administrador inicial queda condicionado a configuración explícita por entorno, sin credenciales hardcodeadas.
- Fase 02 completada: registro/perfil adaptados a Guaranda Go, rol ciclista por defecto, middleware/policy admin, bloqueo de usuarios inactivos y panel inicial de gestión de usuarios.
- Fase 03 completada: base del panel administrador mobile first, navegación admin y dashboard con métricas simples.
- Fase 04 completada: CRUD administrativo de rutas oficiales con estados, categoría, dificultad, imágenes, recomendaciones, observaciones, GeoJSON, métricas, versionado e inactivación sin borrado físico; `/routes` muestra solo rutas activas a ciclistas.
- Fase 05 completada: mapa Leaflet para rutas activas, detalle de ruta, GeoJSON, inicio/final, POIs asociados, incidencias en revisión, ubicación actual e indicadores conexión/GPS.
- Regla operativa actualizada: si una fase necesita migraciones/seeders o cambios de datos, se implementan y aplican en la BD remota sin pedir confirmación adicional, cuidando credenciales y evitando cambios destructivos directos.
- Fase 05 no requirió migración ni operación de BD remota porque el esquema existente ya cubría las necesidades.
- Fase 06 completada: CRUD administrativo de POIs, detalles por categoría, horarios, imágenes, asociación ruta-POI, sugerencias y reportes de ciclistas.
- Fase 06 no requirió migración ni operación de BD remota porque el esquema existente ya cubría las necesidades.
- Fase 07 completada: reporte online de incidencias con foto máxima 5 MB, notificación admin, revisión administrativa y visibilidad solo para incidencias `en revisión`.
- Fase 07 no requirió migración ni operación de BD remota porque el esquema existente ya cubría incidencias, archivos y notificaciones.
- Fase 08 completada: ciclo de recorrido GPS, puntos, métricas, validez 90%, resumen final y exportación GPX/GeoJSON.
- Fase 08 no requirió migración ni operación de BD remota porque el esquema existente ya cubría recorridos, estados y puntos GPS.
- La prueba real Android de GPS queda planificada para Fase 12/Capacitor.
- Fase 09 completada: paquetes offline de ruta, registro de descargas, cola local IndexedDB, sincronización de incidencias/fotos y recorridos, detección de versión desactualizada y estado visible en UI.
- Fase 09 no requirió migración ni operación de BD remota porque el esquema existente ya cubría descargas y cola de sincronización.
- SQLite nativo Android y mapa offline empaquetado quedan preparados para validación en Fase 12/Capacitor.
- Fase 10 completada: favoritos, listado de favoritas, valoración condicionada a recorrido válido, moderación admin, respuesta administrativa y promedio público con solo valoraciones aprobadas.
- Fase 10 no requirió migración ni operación de BD remota porque el esquema existente ya cubría favoritos, valoraciones y estados de moderación.
- Fase 11 completada: interfaz de chat, proxy backend Laravel hacia n8n, contexto mínimo, respuestas JSON de `Respond to Webhook`, persistencia de conversaciones/mensajes, errores/timeouts, aviso offline y soft delete de conversaciones.
- Fase 11 no requirió migración ni operación de BD remota porque el esquema existente ya cubría `conversaciones_ia` y `mensajes_ia`.
- Fase 12 en revisión: Capacitor Android, plugins nativos, permisos Android, minSdk 33, helper nativo y sync Android funcionan; GitHub Actions genera APK debug conectado a `https://ciclismo.devs-ueb.tech`; falta instalar/probar en Android 13+.
- `npm run build`, `npx cap sync android`, `npx cap doctor android`, `npm run types:check`, `npm run lint:check`, `npm run format:check` y GitHub Actions `android-apk` pasan.
- Dokploy despliega correctamente `https://ciclismo.devs-ueb.tech` con HTTP 200 y TrustProxies configurado para URLs HTTPS detrás del reverse proxy.
- El entrypoint Docker ya no ejecuta seeders por defecto; solo los ejecuta si `RUN_SEEDERS=true`.
- Se eliminaron restos visibles del starter: dashboard vacío, links Repository/Documentation, welcome genérico, header global de “Centro de control” y componente visual `placeholder-pattern` sin uso.
- Navegación actual: desktop/tablet usa sidebar; móvil usa bottom navbar fija con menú “Más”. Cada módulo tiene su propio título.
- Fase 13 completada: `/admin/catalogs`, `/admin/statistics` y `/admin/settings` son módulos reales; se eliminó el placeholder administrativo genérico.
- Catálogos permite crear/actualizar registros de catálogos del sistema; estadísticas registra consultas de rutas, muestra métricas/rankings con filtros por fecha y exporta CSV; configuración muestra estado operativo sin exponer secretos.
- Fase 14 queda en revisión: validación local completa aprobada, pero falta evidencia de prueba física del APK en Android 13+ para cerrar la entrega final sin mentir.

## Bugfix testers 2026-06-30

- Se usa `.codex/bugfix/` como carpeta de seguimiento por orden de corrección.
- Rutas admin: creación/edición con mapa Leaflet.draw, búsqueda OSM/Nominatim, distancia calculada, inicio/final derivados del trazado y selección de POIs activos.
- Imágenes: portada y galería de rutas por archivo; portadas visibles para ciclistas; POIs con miniaturas cuando existan.
- Registro: checklist visual de contraseña antes de enviar.
- Valoraciones: nueva tabla `archivos_valoracion_ruta` para fotos/videos de experiencias asociadas a comentarios moderados.
- n8n no se trató como bug porque el flujo aún no está creado/configurado.
- Nueva dependencia frontend: `leaflet-draw`, `leaflet-control-geocoder`, `@types/leaflet-draw`.
- Nueva migración pendiente de deploy/producción: `2026_06_30_000015_create_route_rating_files_table.php`.


## Traducción español 2026-06-30

- Se tradujeron los flujos de auth, ajustes, seguridad, passkeys, 2FA, menú de usuario y mensajes flash backend.
- Se agregaron archivos `lang/es` para auth, passwords, validación y textos base de correos/notificaciones Laravel.
- Laravel queda por defecto en locale `es`, fallback `es` y faker `es_EC`; producción debe mantener `APP_LOCALE=es` si define esa variable.
- El escáner de inglés queda con falsos positivos de clases CSS/identificadores/acrónimos técnicos, no textos visibles pendientes.

## Próxima tarea inmediata

Instalar el APK generado por GitHub Actions en un Android 13+ y validar:

- carga de `https://ciclismo.devs-ueb.tech`,
- login,
- mapa,
- GPS,
- cámara para incidencias,
- offline/cola/sincronización,
- notificaciones/permisos.

Después de esa prueba manual, marcar Fase 12 y Fase 14 como `Completado` si todo pasa.

- BD remota: catálogo `generos` limpiado; solo quedan `masculino` y `femenino`. El administrador inicial quedó con género `masculino`; no hay usuarios con `gender_id` nulo.

## Bloqueos actuales

- No hay bloqueo de compilación APK: GitHub Actions genera el artifact `guaranda-go-debug-apk`.
- No hay bloqueo de deploy web: Dokploy responde HTTP 200.
- Falta dispositivo o emulador Android 13+ para certificar instalación, login, mapa, GPS, cámara, offline y notificaciones.

## Bugfix testers ampliado 2026-06-30

- Se agregaron planes pendientes de aprobación en `.codex/bugfix/14-18` para mejorar edición de rutas, POIs, catálogos, mapa cicloturístico/GPS y bienvenida de usuario.
- No se implementaron cambios de código en esta sesión; solo planificación/documentación de correcciones.

## Implementación bugfix pendientes 2026-06-30

- Implementado primer bloque aprobado de correcciones de testers en Laravel/React.
- Asociación POI-ruta reemplazada por UI estructurada en administración, manteniendo serialización compatible con `route_links_text`.
- Refactor visual mobile first aplicado a tema global, navegación, rutas, detalle, mapa, chat y menú con estética verde/redondeada inspirada en bocetos, sin cambiar lógica ni orden funcional.
- Desnivel automático integrado con OpenTopoData mediante proxy backend Laravel; configurable por entorno y con muestreo máximo de 100 puntos por solicitud.
- Chat n8n corregido: Laravel no persiste nuevas conversaciones/mensajes al enviar; la memoria queda a cargo del workflow/nodo Agente de n8n. Tablas locales de IA se conservan intactas para compatibilidad/legado.


## UX móvil flat 2026-06-30

- Se reemplazó la estética muy redondeada/con degradados por flat design: bordes moderados, superficies limpias, navegación inferior plana y componentes base sin sombras decorativas.
- Las pantallas de ciclista se compactaron con tabs para reducir scroll vertical: listado/mapa de rutas, detalle de ruta, chat/historial y resumen de recorrido.
- El detalle de ruta separa mapa, recorrido/detalle, POIs, reportes, opiniones y modo sin conexión en secciones independientes.
- El chat separa conversación e historial; no muestra nombres técnicos como n8n, Laravel, webhook o proxy al usuario final.
- Se limpiaron textos de usuario final para evitar lenguaje administrativo como “comentarios aprobados” y “revisión administrativa”.
- Validación frontend aprobada: tipos, lint, formato y build.

- Navegación Android: agregado `@capacitor/app` y listener global de botón atrás para evitar salidas accidentales desde pantallas internas; sincronizado con Capacitor Android.


## Fase 15 agente n8n tools 2026-07-01

- Fase 15 en progreso: Laravel ya expone tools API para que n8n consulte la BD sin embeddings.
- Tools implementadas bajo `/api/agent/*`: rutas cercanas, detalle de ruta, POIs cercanos, progreso/distancia restante y alertas visibles.
- Seguridad implementada con `GUARANDA_GO_AGENT_TOOL_TOKEN`; n8n debe enviar Bearer token o `X-Agent-Token`.
- No se agregaron tablas; se reutilizan rutas, geometría, métricas, POIs, incidencias y recorridos existentes.
- Pendiente: enviar ubicación transitoria desde chat, contrato de cards en respuesta n8n, render de cards y TTS local.

## Fase 16 refactor frontend mobile first 2026-07-01

- Fase 16 completada: refactor visual mobile first integral aplicado sobre frontend React/Inertia.
- Inventario detectado: 32 páginas Inertia, 56 componentes React, 9 layouts y 25 componentes shadcn/ui bajo `ciclismo-guaranda/resources/js`.
- Stitch MCP usado: proyecto `projects/6540137781896183848` y design system `assets/8743915527678384604` (`Guaranda Go - Andean Field UI`).
- La generación de pantalla style board en Stitch dio timeout y no dejó pantallas listadas; no se reintentó.
- Validación frontend aprobada: `types:check`, `lint:check`, `format:check` y `build`. No se realizaron cambios de BD ni backend.
- Sistema visual Andean Field UI aplicado: tokens globales, shadcn base, navbar, auth, welcome, ajustes, mapas, tabs, modales, inputs, badges, botones y toasts.
