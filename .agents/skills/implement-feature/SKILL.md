---
name: implement-feature
description: Use when adding or changing Guaranda Go behavior. Guides specification, implementation, validation, documentation and progress updates for the Laravel/Inertia/Capacitor stack.
---

# Implementar funcionalidad

## Contexto

Lee `AGENTS.md`, el plan/fase aplicable en `.codex/plans/`, `docs/quality/definition-of-done.md`, la arquitectura relevante y el documento de dominio afectado. Para trabajo no trivial, revisa primero `.codex/progress/current_status.md`.

## Flujo

1. Define usuario, permiso, flujo, estados y criterio de aceptación.
2. Actualiza dominio/plan si cambia una regla o decisión.
3. Implementa el cambio coherente más pequeño: Request/Policy/Action-Service/Controller/Resource en backend; Wayfinder/componentes/hooks en frontend.
4. Para schema usa migración Laravel; para integración externa crea una frontera de servicio segura.
5. Cubre validación, autorización y fallos además del caso exitoso.
6. Ejecuta la validación proporcional y actualiza la documentación/progreso afectados.

## Guardrails

- Fortify gestiona identidad; no crear auth propia.
- Eloquent/migraciones gestionan schema; no hacer cambios estructurales directos en producción.
- No hardcodear URL, token, webhook ni secreto; no enviarlos al cliente.
- No usar URLs hardcodeadas en React cuando Wayfinder aplica.
- No confundir CI/build con prueba real de una función nativa Android.
