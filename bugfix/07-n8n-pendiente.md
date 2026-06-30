# 07 — n8n pendiente externo

## Contexto

El asistente IA aparece como funcional en la app, pero el usuario confirmó que el flujo n8n todavía no está creado/configurado.

## Decisión

- No se trató como bug de código.
- La app ya muestra aviso cuando falta `GUARANDA_GO_N8N_WEBHOOK_URL`.
- No se hardcodeó webhook ni se simuló IA en frontend/APK.
- Queda pendiente crear el flujo n8n y configurar el secret/env en servidor.

## Estado

- Pendiente de configuración externa, no de código.
