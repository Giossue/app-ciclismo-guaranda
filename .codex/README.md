# .codex — Knowledge folders de Guaranda Go

Esta carpeta contiene conocimiento operativo y detallado para agentes de IA que trabajen en Guaranda Go. El archivo `../AGENTS.md` funciona como router principal y decide qué documentos leer según la tarea.

Para el mapa técnico rápido y las reglas transversales de calidad, seguridad, revisión, rendimiento y ADRs, consulta también `../ARCHITECTURE.md` y `../docs/README.md`. No se debe duplicar aquí ese contenido; `.codex/` conserva el detalle de producto, dominio, fase y operación propio de Guaranda Go.

## Estructura

```txt
.codex/
├── rules/                 # Reglas transversales obligatorias
├── project/               # Contexto de producto, alcance y decisiones
├── architecture/          # Arquitectura técnica por capa
├── domain/                # Reglas de negocio por módulo
├── frontend-components/   # shadcn/ui, UI y patrones mobile first
├── workflows/             # Orden de implementación y comandos
├── testing/               # Criterios de aceptación y pruebas
├── progress/              # Estado de fases y bitácora entre sesiones
├── plans/                 # Planes de implementación por fase
└── bugfix/                # Planes y seguimiento de correcciones por feedback/testers
```

## Uso recomendado

1. Lee `../AGENTS.md`.
2. Lee `../README.md` y `../ARCHITECTURE.md` para el producto y sus fronteras.
3. Abre `../docs/` solo para el criterio transversal aplicable.
4. Abre solo los archivos `.codex` relevantes para la tarea.
5. Si trabajas dentro de `ciclismo-guaranda/`, también lee `../ciclismo-guaranda/AGENTS.md` porque contiene reglas de Laravel Boost.

## Capas de conocimiento

| Capa | Carpeta | Propósito |
|---|---|---|
| Reglas | `rules/` | Normas obligatorias para todo cambio |
| Producto | `project/` | Qué es Guaranda Go, alcance y límites |
| Arquitectura | `architecture/` | Backend, frontend, Android, offline, mapas, IA |
| Dominio | `domain/` | Reglas de negocio por módulo funcional |
| UI | `frontend-components/` | shadcn/ui, React, patrones mobile first |
| Flujo | `workflows/` | Orden de construcción y validación |
| Testing | `testing/` | Criterios de aceptación funcionales |
| Progreso | `progress/` | Estado actual, fases, bitácora y decisiones |
| Planes | `plans/` | Planes `.md` por fase con estado y criterios |
| Bugfix | `bugfix/` | Planes y seguimiento de correcciones por feedback/testers |

## Regla clave

Guaranda Go es una **app híbrida Android** con backend Laravel, frontend React/Inertia y empaquetado Capacitor. No trates el proyecto como una PWA pura ni como una app nativa Kotlin.
