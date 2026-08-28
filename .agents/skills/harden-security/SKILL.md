---
name: harden-security
description: Use when changing input validation, auth, authorization, files, secrets, offline sync or external integrations, and when reviewing security defects.
---

# Endurecer seguridad

## Contexto

Lee `docs/security/principles.md`, `hardening.md`, `threat-model.md`, arquitectura de auth/integración y la especificación del flujo.

## Flujo

1. Enumera fronteras tocadas: HTTP, auth, archivo, base, cola/offline, Android e integración externa.
2. Define qué dato no es confiable y dónde se valida.
3. Comprueba Policy/Middleware de servidor por registro y transición de estado.
4. Mantén secretos, tokens, logs, errores y respuestas sanitizados.
5. Añade pruebas de rechazo, propiedad, roles, archivos inválidos, timeout y respuesta externa inválida.
6. Registra riesgo residual si existe.

## Guardrails

- La UI nunca es la autorización.
- No aceptar IDs, path, MIME, URL, estado o relación del cliente sin verificarlo.
- No concatenar entrada de usuario en consulta, comando, path o URL.
- n8n y sus tools son siempre servidor-a-servidor; ubicación y contexto se minimizan.
