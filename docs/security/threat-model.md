# Modelo de amenazas

| Activo / frontera | Amenaza | Mitigación |
| --- | --- | --- |
| Cuenta/sesión | Acceso no autorizado o usuario inactivo | Fortify, middleware, policies y pruebas por rol/propiedad. |
| Ubicación y recorridos | Exposición o recolección excesiva | Consentimiento, mínimos datos, HTTPS y ubicación IA transitoria. |
| Archivos de incidencias/valoraciones | Archivo malicioso, tamaño excesivo o path traversal | Validación MIME/tamaño, almacenamiento gestionado y URLs controladas. |
| API/offline | Mutaciones repetidas, ajenas o sin conexión | Validación, ownership, cola idempotente y feedback de sync. |
| OpenAI | Filtración de clave, datos no autorizados o respuesta maliciosa | Clave solo servidor, contexto público acotado, `store: false`, JSON Schema, timeout y validación Laravel. |
| BD/despliegue | Schema/data loss o credencial con privilegio excesivo | Migraciones, backups/plan destructivo, seeders desactivados y secretos de entorno. |
| APK/WebView | Secreto embebido o permisos injustificados | Configuración por entorno, sin secretos en cliente y validación real en Android. |
