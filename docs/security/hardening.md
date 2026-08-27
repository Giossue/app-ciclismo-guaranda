# Controles de hardening

| Frontera | Control |
| --- | --- |
| HTTP | Form Requests/validación, rate limiting, respuestas normalizadas y Policies. |
| Auth | Fortify, confirmación de contraseña para acciones sensibles, 2FA/passkeys según flujo y bloqueo de inactivos. |
| Archivos | Tipo/MIME/tamaño/contenido permitido; incidencias: imagen hasta 5 MB, sin video; nombres/rutas generados por servidor. |
| BD | Migraciones, consultas parametrizadas/Eloquent, permisos mínimos y plan explícito ante cambios destructivos. |
| Integraciones | Timeouts, token servidor-a-servidor, allowlist/configuración por entorno y sin reenviar payloads crudos. |
| Offline/nativo | Permisos justificados, consentimientos claros, notificación persistente si hay GPS en segundo plano y sincronización autenticada. |
| Observabilidad | Logs sanitizados y auditoría de acciones administrativas relevantes. |

Añade pruebas para las rutas de rechazo, no solo el camino válido. Nunca aceptes IDs, relaciones, paths o estados enviados por cliente sin verificar permiso y transición válida.
