---
name: create-migration
description: Use when changing Laravel schema, Eloquent persistence or transformations of Guaranda Go production data.
---

# Crear migración

## Contexto

Lee `docs/architecture/database.md`, `.codex/rules/database_operations.md`, el modelo de dominio afectado y su plan.

## Flujo

1. Determina si el cambio es aditivo, destructivo o transformación de datos, y qué flujos afecta.
2. Genera la migración con Artisan y actualiza modelos, casts, relaciones, factories y Resources necesarios.
3. Para geodatos, conserva compatibilidad de tests SQLite solo donde se requiera, sin degradar PostgreSQL/PostGIS.
4. Aplica schema mediante migración. Para datos reales de producción usa la operación explícita configurada, nunca un seeder automático de deploy.
5. Prueba migración, validación, autorización y comportamiento resultante; actualiza contexto/progreso.

## Guardrails

- Los cambios destructivos requieren plan de datos, respaldo/impacto y estrategia reversible si es posible.
- No guardar credenciales ni ejecutar seeders de producción por defecto.
- No editar a mano artefactos generados ni asumir que SQLite reproduce todas las capacidades PostGIS.
