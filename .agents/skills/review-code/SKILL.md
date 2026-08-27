---
name: review-code
description: Use when reviewing Guaranda Go changes for bugs, privacy/security, architecture drift, test gaps and documentation gaps.
---

# Revisar código

## Contexto

Lee `AGENTS.md`, `docs/quality/code-review.md`, seguridad, rendimiento, arquitectura y el documento de dominio/plan afectado.

## Enfoque

Da hallazgos primero, ordenados por **Crítico**, **Requerido**, **Considerar**, **Nit** o **FYI**. Indica archivo/línea, impacto y remedio concreto; después, preguntas y resumen.

Revisa bugs/pérdida de datos, Fortify/Policies, validación, migraciones/PostGIS, N+1/paginación, Wayfinder/UI states, integraciones n8n, datos sensibles y pruebas. Si no hay hallazgos, dilo y señala riesgo residual.

## Guardrails

- No sustituir inspección por el resumen del diff.
- No aceptar autorización solo visual, secretos en cliente ni schema sin migración.
- No marcar como validada una capacidad Android sin prueba real cuando esta sea necesaria.
