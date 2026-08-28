---
name: optimize-performance
description: Use for measured load, query, map, sync or rendering performance work in Guaranda Go.
---

# Optimizar rendimiento

## Contexto

Lee `docs/quality/performance.md`, la arquitectura de capa afectada y `docs/architecture/database.md` para consultas/índices.

## Flujo

1. Declara síntoma y costo visible para ciclista, administrador u operación.
2. Mide baseline reproducible con datos y condiciones representativas.
3. Identifica el cuello con evidencia, cambia una sola variable y vuelve a medir igual.
4. Conserva solo mejora fuera de la variación normal; de lo contrario revierte.
5. Registra números, decisión y protección contra regresión.

## Guardrails

- No optimizar por intuición ni obtener velocidad eliminando trabajo requerido.
- No dejar N+1, listas sin paginar, geometrías/medios innecesarios o caché sin perfil.
- No mezclar varias optimizaciones en una misma medición.
