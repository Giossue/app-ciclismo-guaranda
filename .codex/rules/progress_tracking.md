# Seguimiento de progreso por fases

La carpeta `.codex/progress/` mantiene el estado del proyecto entre sesiones de agentes.

## Regla obligatoria

Cuando un agente complete, inicie, bloquee o cambie el estado de una tarea/fase, debe actualizar los archivos de progreso correspondientes.

## Archivos principales

- `.codex/progress/phases.md`: fases del proyecto y estado general.
- `.codex/progress/current_status.md`: estado actual operativo para retomar trabajo.
- `.codex/progress/session_log.md`: bitácora resumida de cambios por sesión.
- `.codex/progress/decisions_log.md`: decisiones relevantes tomadas durante el desarrollo.

## Estados permitidos

- `Pendiente`
- `En progreso`
- `Bloqueado`
- `Completado`
- `Requiere revisión`

## Cuándo actualizar

Actualizar progreso cuando:

- Se crea una migración/modelo/módulo importante.
- Se termina una fase o subfase.
- Una tarea queda bloqueada por decisión, credenciales, errores o dependencia externa.
- Se cambia una decisión técnica.
- Se ejecuta o falla una validación relevante.

## Regla de estilo

Las notas deben ser breves, fechadas y útiles para que otro agente pueda continuar sin releer toda la conversación.
