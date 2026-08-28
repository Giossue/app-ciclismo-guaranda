# Integraciones externas

| Integración | Frontera y regla |
| --- | --- |
| n8n | Laravel actúa como proxy del webhook. n8n ejecuta el agente, memoria y clima; frontend/APK no conocen webhook ni token. |
| Tools del agente | `/api/agent/*` usa token servidor-a-servidor y devuelve solo datos autorizados. |
| AI Elements | Biblioteca fuente de UI preparada pero todavía desacoplada del chat. No cambia n8n ni decide el futuro transporte del agente. |
| OpenTopoData | Servicio Laravel configurable por entorno; nunca petición directa desde frontend/APK. |
| Mapas/rutas | Leaflet y OSM/Nominatim se encapsulan en UI/servicios; validar la API actual antes de cambiarla. |
| Capacitor | Adaptadores nativos con fallback web y prueba real Android para GPS, cámara, SQLite, archivos y notificaciones. |

No enviar datos personales innecesarios, secretos, URLs privadas o payloads completos a integraciones. Normalizar timeouts, fallos y reintentos para que la UI muestre estados seguros. Detalle: `.codex/architecture/n8n_webhook_agent.md`, `maps_routing.md`, `offline_sync.md` y `mobile_capacitor_android.md`.
