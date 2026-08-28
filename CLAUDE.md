# Memoria de proyecto para Claude

Lee primero [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md), [docs/product/overview.md](docs/product/overview.md) y [docs/quality/definition-of-done.md](docs/quality/definition-of-done.md).

- `docs/` concentra el contexto transversal para implementar, revisar y validar.
- `.codex/` conserva el detalle de dominio, reglas operativas, decisiones, progreso y planes por fase.
- Guaranda Go usa Laravel 13 + React/Inertia + Capacitor; no trasladar patrones de Express, Next, Prisma o Better Auth.
- Mantén secretos fuera del repositorio, frontend, APK, logs y resúmenes.
- Actualiza la fuente de verdad afectada junto al comportamiento. No declares terminado un cambio sin la validación proporcional ejecutada.
