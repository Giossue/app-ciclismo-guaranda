# Integración con agente externo n8n

## Decisión clave

Guaranda Go no implementa un módulo nativo de IA. El agente de IA vive fuera del sistema, en n8n, ya desplegado en el servidor mediante Dokploy.

## Responsabilidad de Guaranda Go

- Mostrar interfaz de chat.
- Enviar la solicitud al webhook configurado.
- Enviar contexto mínimo necesario si corresponde.
- Recibir el JSON devuelto por el nodo `Respond to Webhook`.
- Mostrar/procesar la respuesta en la app.
- Manejar errores, timeouts o respuestas inválidas.

## Responsabilidad de n8n

- Prompts.
- Modelo IA: DeepSeek v4 Flash o GPT-5.5.
- Herramientas.
- Open-Meteo.
- Reglas anti-alucinación.
- Base de conocimiento.
- Límites de mensajes.
- Formato del JSON de respuesta.

## Reglas de seguridad

- No poner URL secreta del webhook en frontend si puede evitarse; preferir proxy backend Laravel.
- No poner API keys en APK.
- No enviar datos personales innecesarios.
- Chatbot solo online.

## Datos posibles para contexto

- Ruta activa.
- Edad del usuario.
- Dificultad de ruta.
- Observaciones/recomendaciones.
- POIs relacionados.
- Incidencias activas validadas.


## Tools Laravel para el agente

El agente de n8n no usa embeddings para la información de Guaranda Go. Cuando necesita datos del sistema, debe usar tools HTTP protegidas contra Laravel.

Endpoints actuales:

```txt
POST /api/agent/routes/search
GET  /api/agent/routes/{route}
GET  /api/agent/routes/{route}/alerts
POST /api/agent/pois/search
POST /api/agent/navigation/progress
```

Seguridad:

- Todas las tools usan middleware `agent.tool`.
- El token se configura con `GUARANDA_GO_AGENT_TOOL_TOKEN`.
- n8n debe enviar `Authorization: Bearer <token>` o `X-Agent-Token`.
- El token no se expone en frontend/APK.

Responsabilidad de las tools:

- Exponer solo rutas activas.
- Exponer solo POIs activos.
- Exponer solo alertas visibles para ciclistas.
- Calcular distancias/progreso con GeoJSON y fallback Haversine/LineString en PHP.
- Devolver datos listos para que n8n construya respuestas y cards.

Contrato esperado para cards:

```json
{
  "type": "route|poi|alert|progress",
  "title": "...",
  "subtitle": "...",
  "description": "...",
  "href": "/routes/slug",
  "image_url": "https://...",
  "meta": ["..."],
  "distance_from_user_km": 1.2
}
```

Pendiente de esta fase:

- Enviar ubicación transitoria desde el chat al webhook n8n.
- Permitir que n8n devuelva `reply`, `voice_text`, `cards` y `suggested_actions`.
- Renderizar cards en el chat.
- Agregar TTS local/open source en frontend/Capacitor.
