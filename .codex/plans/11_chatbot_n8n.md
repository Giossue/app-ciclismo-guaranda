# Fase 11 — Chatbot externo n8n

Estado: `Completado`

## Objetivo

Integrar la app con un agente externo de n8n por webhook.

## Tareas

- Crear interfaz de chat.
- Crear endpoint backend proxy si se decide no exponer webhook.
- Enviar contexto mínimo necesario.
- Recibir JSON de `Respond to Webhook`.
- Mostrar respuesta.
- Manejar errores/timeouts.
- Guardar conversaciones/mensajes.
- Eliminar/ocultar conversación para usuario con soft delete.

## Criterios de finalización

- Chat funciona online.
- No funciona offline y muestra aviso claro.
- No hay secretos de IA/webhook en APK/frontend.
- Historial se guarda correctamente.

## Resultado

- Se implementó `/chat` con interfaz Inertia/React mobile first, historial de conversaciones, selección opcional de ruta activa y aviso explícito cuando no hay conexión.
- Se implementó proxy backend Laravel hacia n8n en `Cyclist\ChatController`, leyendo el webhook desde `GUARANDA_GO_N8N_WEBHOOK_URL` sin exponerlo al frontend/APK.
- Se envía contexto mínimo: app, idioma, edad/rol, ruta activa opcional, mensajes recientes y bandera `offline_available=false`; no se envían email ni nombre del usuario.
- Se aceptan respuestas JSON comunes de `Respond to Webhook`: `reply`, `answer`, `message`, `text`, `response` u `output`.
- Se guardan conversaciones y mensajes en `conversaciones_ia` y `mensajes_ia`; ocultar conversación usa soft delete.
- Se agregaron pruebas de integración para render, proxy, no exposición del webhook, errores de n8n, ownership y validación de ruta activa.
- No se requirió migración ni operación de BD remota porque las tablas de IA ya existían.

## Configuración requerida

En el servidor se debe configurar:

```env
GUARANDA_GO_N8N_WEBHOOK_URL=https://...
GUARANDA_GO_N8N_TIMEOUT_SECONDS=20
```

El flujo n8n debe responder JSON, idealmente:

```json
{ "reply": "texto de respuesta..." }
```

## Validación ejecutada

```bash
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter=ChatbotN8nTest
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
