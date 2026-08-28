---
name: commit-changes
description: Use only when the user asks to commit, branch, push or open a pull request. Splits changes into reviewable verified commits.
---

# Confirmar cambios

## Contexto

Lee `docs/quality/version-control.md`, `docs/quality/definition-of-done.md` y `AGENTS.md`.

## Flujo

1. Revisa el diff total y preserva cambios ajenos.
2. Agrupa unidades coherentes en orden de dependencia: schema, backend, frontend, pruebas/documentación.
3. Prepara una unidad, verifica el diff preparado y ejecuta validación proporcional.
4. Confirma con `type(scope): verbo imperativo` bajo 72 caracteres; cuerpo solo si explica una razón no obvia.
5. Repite por unidad. Solo push/PR si el usuario lo pidió.

## Guardrails

- Nunca preparar todo sin inspeccionarlo, mezclar refactor con comportamiento, ni separar pruebas/docs de la unidad.
- Nunca confirmar secretos, `.env`, outputs, directorios de dependencias o cambios de otro autor.
- No reescribir historial publicado ni hacer push por iniciativa propia.
