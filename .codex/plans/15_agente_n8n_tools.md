# Fase 15 — Agente n8n con tools Laravel

Estado: En progreso

## Objetivo

Convertir el asistente de Guaranda Go en un agente cicloturístico conectado a datos reales del sistema, sin embeddings, usando n8n como orquestador y Laravel como fuente segura de información mediante tools HTTP.

## Principios

- n8n sigue siendo el agente y dueño de la memoria conversacional.
- Laravel no persiste nuevas conversaciones/mensajes en cada envío de chat.
- Laravel expone tools API protegidas para consultar datos vivos de la BD.
- No se agregan tablas nuevas para esta fase salvo que aparezca una necesidad real de auditoría posterior.
- No se exponen secretos, URLs internas ni tokens en frontend/APK.
- La ubicación del usuario se usa como dato transitorio para recomendaciones/distancias; no se guarda por el chat.
- Las respuestas para usuario final no deben mencionar n8n, Laravel, webhook, base de datos, moderación ni términos administrativos.

## Alcance funcional

### 1. Tools API protegidas para n8n

Crear endpoints JSON bajo `/api/agent/*`, protegidos por token de servidor:

- `POST /api/agent/routes/search`
  - Busca rutas activas.
  - Soporta ubicación opcional del usuario.
  - Devuelve rutas con métricas, dificultad, categoría, distancia aproximada desde el usuario y link interno.

- `GET /api/agent/routes/{route}`
  - Devuelve detalle de ruta activa por slug/id.
  - Incluye métricas, recomendaciones, observaciones, POIs, alertas visibles e imagen principal.

- `POST /api/agent/pois/search`
  - Busca POIs activos.
  - Soporta ubicación, ruta opcional y categoría/texto opcional.
  - Devuelve POIs con categoría, horarios, contacto, detalles relevantes y distancia aproximada.

- `POST /api/agent/navigation/progress`
  - Calcula distancia aproximada al inicio/final y avance estimado.
  - Usa GeoJSON de ruta cuando exista; fallback a inicio/final.

- `GET /api/agent/routes/{route}/alerts`
  - Devuelve alertas visibles de una ruta activa.

### 2. Contrato de seguridad

- Agregar configuración:
  - `GUARANDA_GO_AGENT_TOOL_TOKEN`
- Middleware `agent.tool`:
  - Lee `Authorization: Bearer <token>` o `X-Agent-Token`.
  - Devuelve `401` si falta o no coincide.
- Token solo en entorno servidor/n8n, nunca en frontend/APK.

### 3. Contrato JSON para cards

Las tools deben devolver datos listos para que n8n construya cards:

```json
{
  "type": "route|poi|alert|progress",
  "title": "...",
  "subtitle": "...",
  "description": "...",
  "href": "/routes/...",
  "image_url": "https://...",
  "meta": ["..."],
  "distance_from_user_km": 1.2
}
```

### 4. Chat con ubicación transitoria

En una segunda iteración de esta fase:

- Agregar opción en UI: compartir ubicación con asistente.
- Enviar `latitude`, `longitude`, `accuracy_m`, `recorded_at` al webhook n8n.
- No guardar ubicación en tablas de chat.

### 5. Respuesta enriquecida del agente

En una segunda iteración de esta fase:

- Permitir que n8n responda:
  - `reply`
  - `voice_text`
  - `cards`
  - `suggested_actions`
- Renderizar cards en el chat.

### 6. TTS local/open source

En una segunda iteración de esta fase:

- Implementar lectura local de `voice_text`.
- Opción inicial: Web Speech API `speechSynthesis`.
- Opción nativa posterior: plugin Capacitor TTS open source.
- No usar API externa de voz.

## Criterios de aceptación

- Las tools API responden solo con token válido.
- Rutas inactivas no se exponen en tools.
- POIs inactivos no se exponen en tools.
- Las alertas devueltas son solo las visibles para ciclistas.
- Las distancias se calculan aunque PostGIS no esté disponible, usando fallback Haversine/GeoJSON.
- No se crean ni eliminan tablas.
- Tests Pest cubren autorización, búsqueda de rutas, búsqueda de POIs, detalle, alertas y progreso.
- Validación mínima:
  - `vendor/bin/pint --dirty --format agent`
  - `php artisan test --compact --filter=AgentToolsTest`
  - `composer types:check`
  - `php artisan route:cache --no-interaction`

## Fuera de alcance inmediato

- Crear el workflow n8n dentro de n8n.
- Generar audio desde servidor.
- Agregar embeddings o vector store.
- Persistir transcripciones del chat en Laravel.
- Cambios destructivos de BD.
