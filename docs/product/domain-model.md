# Modelo de dominio

Esta es una vista de navegación, no un reemplazo de los documentos de `.codex/domain/`.

| Área | Entidades principales | Invariantes esenciales |
| --- | --- | --- |
| Identidad | Usuario, rol, consentimiento | Registro público crea ciclista; un usuario inactivo no opera. |
| Rutas | Ruta, geometría, métrica, imagen, recomendación | Solo rutas activas se muestran al ciclista; inactivar preserva trazabilidad. |
| POIs | Punto de interés, horario, imagen, asociación | Sugerencias/reportes quedan pendientes de revisión. |
| Recorridos | Recorrido, punto GPS, estado | Un recorrido es válido desde 90 % de avance. |
| Incidencias | Incidencia, archivo, estado | Fotos hasta 5 MB; solo incidencias revisadas se hacen visibles. |
| Interacción | Favorito, valoración, multimedia | Una valoración requiere recorrido válido y solo aprobadas cuentan públicamente. |
| Offline | Descarga de ruta, entrada de cola | La cola sincroniza incidencias/fotos y recorridos al recuperar red. |
| Asistente | Conversación IA, mensaje IA | El agente vive en n8n; ubicación es opcional y transitoria. |

Documentos de detalle: `users_auth.md`, `routes.md`, `pois.md`, `incidents.md`, `gps_tracks.md`, `ratings_comments.md` y `chatbot_ia.md` en `.codex/domain/`.
