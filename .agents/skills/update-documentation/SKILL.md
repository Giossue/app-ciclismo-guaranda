---
name: update-documentation
description: Use when Guaranda Go behavior, API, database, architecture, quality rules, security constraints, plans or decisions change.
---

# Actualizar documentación

## Flujo

1. Identifica la fuente de verdad más cercana: `README.md`, `docs/`, `.codex/domain/`, `.codex/architecture/`, `.codex/rules/` o el plan/progreso.
2. Actualiza esa fuente y solo las referencias derivadas necesarias.
3. Registra decisiones duraderas en `.codex/progress/decisions_log.md`; registra sesiones/fases según `AGENTS.md`.
4. Mantén índices navegables, tablas/checklists escaneables y enlaces válidos.

## Guardrails

- No dupliques especificaciones extensas entre `docs/` y `.codex/`; enlaza a la fuente principal.
- No enterrar reglas críticas en prosa o en un resumen de commit.
- No afirmar estado, deploy o validación sin evidencia real.
