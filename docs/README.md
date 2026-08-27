# Índice de contexto de Guaranda Go

`docs/` es la capa transversal de conocimiento para agentes y revisiones. Resume cómo planificar, implementar y evaluar cambios sin duplicar las especificaciones detalladas de `.codex/`.

## Secciones

- `product/`: propósito, lenguaje del dominio y formato de especificaciones nuevas.
- `architecture/`: límites técnicos, stack y patrones por capa.
- `quality/`: Definition of Done, pruebas, revisión, rendimiento y observabilidad.
- `security/`: principios, controles y amenazas relevantes.
- `plans/`: índice de trabajo activo, terminado y deuda; los planes de fase viven en `.codex/plans/`.
- `generated/`: referencias derivadas que nunca se editan manualmente.

## Fuentes de verdad

| Tema | Fuente principal |
| --- | --- |
| Alcance funcional completo | `README.md` y `.codex/project/` |
| Dominio y reglas por módulo | `.codex/domain/` |
| Arquitectura específica | `.codex/architecture/` |
| Estado y planes de fases | `.codex/progress/` y `.codex/plans/` |
| Calidad, seguridad y método de trabajo | este directorio |

Cuando una regla aparezca en más de un sitio, sigue el orden de prioridad indicado en `AGENTS.md` y actualiza la fuente principal, no copias grandes de texto.
