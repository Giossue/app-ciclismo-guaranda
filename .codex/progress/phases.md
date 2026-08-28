# Fases de desarrollo — Guaranda Go

| Fase | Estado | Descripción |
|---|---|---|
| 00. Base actual | Completado | Knowledge base, starter Laravel/React, esquema de BD, modelos y BD remota inicial validados. |
| 01. Seeders/catálogos iniciales | Completado | Roles, géneros, estados, categorías, tipos y catálogos sembrados de forma idempotente en BD remota. |
| 02. Autenticación, roles y usuarios | Completado | Registro completo, rol ciclista por defecto, middleware/policies admin, bloqueo de inactivos y gestión inicial de usuarios. |
| 03. Panel administrador base | Completado | Layout admin, navegación mobile first, dashboard con métricas simples y rutas base protegidas por rol. |
| 04. Rutas administrativas | Completado | CRUD admin de rutas oficiales con estados, catálogos, GeoJSON, métricas, imágenes, recomendaciones, observaciones, versionado y visibilidad activa para ciclistas. |
| 05. Mapa y visualización de rutas | Completado | Leaflet integrado para rutas activas, detalle, GeoJSON, inicio/final, POIs, incidencias en revisión, ubicación actual e indicadores conexión/GPS. |
| 06. POIs | Completado | CRUD admin de POIs, detalles por categoría, horarios, imágenes, asociación ruta-POI, sugerencias y reportes de ciclistas. |
| 07. Incidencias | Completado | Reportes online con foto máxima 5 MB, notificación admin, revisión de estados y visibilidad solo para incidencias en revisión. |
| 08. Recorridos GPS | Completado | Inicio, pausa/reanudación, finalización/cancelación, puntos GPS cada 60s desde UI, métricas, validez 90% y exportación GPX/GeoJSON. |
| 09. Offline y sincronización | Completado | Paquetes offline, descargas, cola local IndexedDB, sync de incidencias/fotos/recorridos y detección de versiones; SQLite/mapa nativo preparados para validación Android. |
| 10. Valoraciones y favoritos | Completado | Favoritos, listado, ratings con recorrido válido, moderación, respuesta admin y promedio aprobado. |
| 11. n8n chatbot | Completado | Interfaz de chat, proxy backend seguro a n8n, contexto mínimo, persistencia de historial, manejo de errores/offline y soft delete de conversaciones. |
| 12. Capacitor Android/APK | Requiere revisión | Capacitor Android, plugins y permisos configurados; GitHub Actions genera APK debug con URL HTTPS del backend. Falta instalar/probar en Android 13+. |
| 13. Estadísticas/reportes | Completado | Analítica admin real con métricas, rankings, filtros por fecha, registro de consultas de rutas y exportación CSV. |
| 14. Validación final | Requiere revisión | Validación local de código/build/rutas aprobada; falta certificación manual en Android real antes de marcar entrega final cerrada. |
| 15. Agente n8n con tools Laravel | En progreso | Tools API protegidas para que n8n consulte rutas, POIs, alertas y progreso/distancias desde la BD sin embeddings. |
| 16. Refactor frontend mobile first integral | Completado | Rediseño total UI mobile first de auth, ciclista, admin, ajustes, componentes base, modales, tabs, navbar, badges, botones, inputs y toasts. |
