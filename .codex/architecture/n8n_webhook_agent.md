# Integración con agente externo n8n

## Decisión clave

Guaranda Go no implementa un módulo nativo de IA. El agente de IA vive fuera del sistema, en n8n, desplegado en el servidor mediante Dokploy.

Para detalle completo de tablas, columnas, flujo, tools y modelos, ver `.codex/domain/chatbot_ia.md`.

## Responsabilidad de Guaranda Go

- Mostrar interfaz de chat móvil tipo chat real.
- Enviar el mensaje al webhook configurado con payload mínimo fijo.
- Recibir el JSON devuelto por n8n.
- Guardar historial en `conversaciones_ia` y `mensajes_ia` después de recibir respuesta.
- Mostrar/procesar la respuesta en la app.
- Manejar errores, timeouts o respuestas inválidas.

## Responsabilidad de n8n

- System prompt del asistente cicloturístico.
- Modelo IA.
- 3 tools HTTP: `rutas` (incluye rutas + POIs + alertas), `progreso_ruta`, `clima`.
- Memoria Postgres en `conversaciones_ia` (tabla compartida con Laravel).
- Open-Meteo para clima.
- Reglas anti-alucinación.
- Formato de respuesta: `{ reply, voice_text, cards, suggested_actions }`.

## Tablas de base de datos

| Tabla | Uso |
|---|---|
| `conversaciones_ia` | Historial de Laravel + memoria de n8n |
| `mensajes_ia` | Mensajes visibles del chat en la app |

Ver columnas detalladas en `.codex/domain/chatbot_ia.md`.

## Reglas de seguridad

- El webhook no se expone en frontend; Laravel usa proxy backend.
- No poner API keys en APK.
- No enviar datos personales innecesarios al webhook.
- Chatbot solo online.
- Tools protegidas con token `GUARANDA_GO_AGENT_TOOL_TOKEN`.
- Solo se exponen valoraciones aprobadas y alertas en revisión.

## Endpoints API del agente (3 tools consolidadas)

```txt
POST /api/agent/routes            → rutas (listar, recomendar, detalle, alertas, pois)
POST /api/agent/navigation/progress → progreso_ruta (avance/distancia)
```

Clima se resuelve directo en n8n contra Open-Meteo, sin pasar por Laravel.

Todas las tools Laravel usan middleware `agent.tool` con `Authorization: Bearer <token>`.

### Historial de consolidación

| Antes (6 tools) | Ahora (3 tools) |
|---|---|
| `buscar_rutas` | fusionada en `rutas` |
| `detalle_ruta` | fusionada en `rutas` |
| `alertas_ruta` | fusionada en `rutas` |
| `buscar_pois` | fusionada en `rutas` (vía `intent: "pois"`) |
| `progreso_ruta` | se mantiene |
| `clima` | se mantiene |

## Payload que Laravel envía al webhook

Estructura fija, siempre con los mismos campos:

```json
{
  "session_id": "guaranda-go-user-9",
  "message": "texto del usuario",
  "route_id": null,
  "route": { "id": null, "name": null, "...": null },
  "location": { "latitude": null, "longitude": null, "accuracy_m": null, "recorded_at": null }
}
```

Si hay ruta seleccionada, `route` viene con datos completos.
Si hay ubicación, `location` viene con coordenadas reales.

## Contenido que las tools devuelven al agente

La tool `rutas` devuelve todo en una respuesta estructurada, sin duplicar datos:

- Datos base de la ruta (nombre, dificultad, categoría, descripción, tramo inicio/fin).
- Métrica más reciente (distancia, tiempo, desnivel, medio de transporte).
- Recomendaciones y observaciones de seguridad de la ruta.
- Promedio y total de valoraciones aprobadas + últimas 3 opiniones de ciclistas.
- POIs asociados, cada uno con su propia descripción, observaciones, horarios y detalle según categoría.
- Alertas/incidencias visibles (`en revisión`).

Se eliminaron del JSON campos pensados para tarjetas UI que no aportan al agente: `geojson`, `image_url`, `href`, `type`, `subtitle`, `meta`, y el objeto `route` duplicado.

## Workflow de n8n

El JSON completo del workflow está en `.codex/project/n8n_workflow.md`.

Nodos principales:

| Nodo | Tipo | Para qué |
|---|---|---|
| Webhook | webhook | Recibe POST de Laravel |
| Global Constants | globalConstants | Inyecta API_BASE_URL, AGENT_TOOL_TOKEN, OPEN_METEO_BASE_URL |
| Normalizar entrada | code | Extrae session_id, message, route, location, constants |
| agente | langchain agent | Procesa mensaje con 3 tools y memoria |
| rutas | httpRequestTool | POST /api/agent/routes (rutas + POIs + alertas) |
| progreso_ruta | httpRequestTool | POST /api/agent/navigation/progress |
| clima | httpRequestTool | Open-Meteo |
| memory | memoryPostgresChat | Memoria en conversaciones_ia |
| Normalizar respuesta | code | Extrae reply del output |
| ia-respuesta | respondToWebhook | Devuelve JSON a Laravel |