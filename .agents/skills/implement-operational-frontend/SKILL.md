---
name: implement-operational-frontend
description: Use when building or refactoring Guaranda Go dashboards, administration, CRUD, forms, lists, navigation or mobile workflows.
---

# Implementar interfaz operativa

## Contexto

Lee `docs/architecture/frontend.md`, los patrones aplicables de `docs/architecture/`, `docs/quality/frontend-checklist.md`, `.codex/frontend-components/`, la página existente y el contrato backend/Wayfinder.

Cuando intervenga shadcn/ui, carga el skill `shadcn`, consulta `npx shadcn@latest info --json` y la documentación actual de cada componente. Cuando intervengan APIs externas, consulta Context7 antes de asumir su contrato.

## Flujo

1. Identifica la tarea principal del rol y elige la superficie mínima: lista, detalle, diálogo/sheet o página completa.
2. Reutiliza primitives shadcn y patrones de navegación/feedback existentes.
3. Implementa carga, vacío, vacío filtrado, pending, éxito, validación, permiso, offline y fallo cuando correspondan.
4. Renderiza lenguaje de negocio, no IDs ni detalles de Laravel/n8n/storage/moderación interna para ciclistas.
5. Ejercita touch, teclado, 320 px, texto largo, solicitud lenta, tema actual y WebView Android.

## Decisiones

- `Field`/`FieldGroup` para entradas; errores junto a su campo.
- `Dialog` o `Sheet` para CRUD breve; página para flujo largo, riesgoso o multi-sección.
- `Badge` semántico para estados, `Alert` para advertencias persistentes, Sonner para resultado de acción.
- Confirmación fuerte para irreversible; un paso para lo reversible.
- Relación frontend-backend con Wayfinder, no URL manual.

## Guardrails

- No crear navegación de tercer nivel ni tabs que rompan el flujo/back de Android.
- No cards anidadas, KPIs redundantes, títulos repetidos o banners rutinarios permanentes.
- No entregar una mutación sin estados pending/success/error.
- No instalar, sobrescribir ni copiar un componente de registry sin inspeccionar su API, diff, alias, tokens y accesibilidad.
