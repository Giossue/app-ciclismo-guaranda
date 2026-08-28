# Integraciones externas

| Integración | Frontera y regla |
| --- | --- |
| OpenAI Responses | Laravel usa una clave exclusiva de servidor, `store: false`, timeout acotado y un contrato JSON validado. Frontend/APK no conocen la clave. |
| Contexto del asistente | Laravel recupera rutas activas, POIs activos y alertas visibles directamente de la BD, sin endpoint externo de tools. |
| AI Elements | Componentes fuente de UI usados por el chat para Markdown y sugerencias revisables. |
| OpenTopoData | Servicio Laravel configurable por entorno; nunca petición directa desde frontend/APK. |
| Mapas/rutas | Leaflet y OSM/Nominatim se encapsulan en UI/servicios; validar la API actual antes de cambiarla. |
| Capacitor | Adaptadores nativos con fallback web y prueba real Android para GPS, cámara, SQLite, archivos y notificaciones. |

No enviar datos personales innecesarios, secretos, URLs privadas o payloads completos a integraciones. Normalizar timeouts y fallos para que la UI muestre estados seguros. Detalle: `.codex/plans/17_agente_laravel_openai.md`, `maps_routing.md`, `offline_sync.md` y `mobile_capacitor_android.md`.
