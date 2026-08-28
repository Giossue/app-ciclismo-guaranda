# AGENTS.md — Router de conocimiento para Guaranda Go

Este archivo es el punto de entrada para cualquier agente que trabaje en este repositorio Laravel/React. Antes de implementar, modificar o revisar código, usa este router para cargar el contexto correcto desde `README.md`, `ARCHITECTURE.md`, `docs/` y `.codex/`.

## 1. Contexto base obligatorio

Siempre considera estos archivos como fuente principal:

1. `README.md` — especificación completa del producto Guaranda Go.
2. `ARCHITECTURE.md` — mapa técnico de alto nivel y fronteras del sistema real.
3. `docs/README.md` — índice transversal de producto, arquitectura, calidad y seguridad.
4. `.codex/README.md` — mapa del detalle operativo, dominio y progreso.
5. `AGENTS.md` — reglas del proyecto Laravel/React y de Laravel Boost.

Si hay conflicto entre documentos:

1. La petición actual del usuario tiene prioridad.
2. Luego `AGENTS.md` de la raíz.
3. Luego `README.md`.
4. Luego `ARCHITECTURE.md` y `docs/`.
5. Luego los documentos específicos de `.codex/`.
6. Luego reglas de Laravel Boost, especialmente para estilo, tests y paquetes instalados.

## 2. Reglas obligatorias: MCP Context7 y shadcn/ui

El agente tiene a disposición el MCP de **Context7** para consultar documentación actualizada de librerías, frameworks y herramientas.

Reglas:

- Usa Context7 cuando necesites documentación actualizada de librerías externas o APIs: Capacitor, Leaflet, shadcn/ui, React, Inertia, Laravel, OpenAI, PostGIS, pgvector, TileServer GL, OSRM, GraphHopper u OpenRouteService.
- Primero resuelve el ID de librería con `resolve-library-id` y luego consulta con `query-docs`.
- No inventes APIs, métodos, parámetros ni configuraciones cuando se puedan verificar con Context7.
- Para paquetes Laravel instalados en este repositorio, si Laravel Boost está disponible, prioriza sus herramientas/documentación específica del proyecto. Usa Context7 como apoyo cuando Boost no cubra la duda o cuando sea una librería externa.
- No incluyas secretos, tokens, credenciales ni URLs privadas al consultar documentación.

Ver también: `.codex/rules/context7_mcp.md`.

### shadcn/ui

Cuando una tarea cree, modifique, arregle o componga interfaz con shadcn/ui:

1. Carga el skill `shadcn` y consulta primero el contexto real del proyecto con `npx shadcn@latest info --json`.
2. Reutiliza componentes instalados y sus variantes antes de escribir markup o estilos personalizados.
3. Antes de usar, reparar o añadir un componente, consulta su API actual con `npx shadcn@latest docs <componente>`; para componentes no instalados, busca/inspecciona el registry primero.
4. No agregar ni sobrescribir componentes sin respetar la regla de dependencias y sin revisar el diff/compatibilidad con los tokens, alias, accesibilidad y patrones de Guaranda Go.
5. Usa colores semánticos, `FieldGroup`/`Field`, composición accesible y `gap-*`; evita `space-x-*`, `space-y-*`, colores hardcodeados y variantes visuales duplicadas.

Ver también `docs/architecture/frontend.md`, `docs/architecture/component-system.md` y `.codex/frontend-components/ui_rules.md`.

## 3. Router por tipo de tarea

| Si la tarea trata sobre... | Lee primero |
|---|---|
| Visión general, alcance, stack y decisiones | `README.md`, `.codex/project/product_context.md`, `.codex/project/stack_decisions.md` |
| Mapa rápido de componentes y fronteras | `ARCHITECTURE.md`, `docs/architecture/index.md` |
| Especificación de una funcionalidad nueva | `docs/product/overview.md`, `docs/product/domain-model.md`, `.codex/domain/` y el plan relevante |
| Definition of Done, revisión o rendimiento | `docs/quality/definition-of-done.md`, `docs/quality/code-review.md`, `docs/quality/performance.md` |
| Seguridad, amenazas o hardening | `docs/security/principles.md`, `docs/security/hardening.md`, `docs/security/threat-model.md` |
| Observabilidad, logs o fallos de integración | `docs/quality/observability.md`, arquitectura de la integración y `.codex/rules/security_privacy.md` |
| Límites del sistema y qué no construir | `.codex/project/scope_boundaries.md` |
| Reglas generales de desarrollo | `.codex/rules/project_rules.md` |
| Seguimiento de progreso por fases | `.codex/rules/progress_tracking.md`, `.codex/progress/current_status.md`, `.codex/progress/phases.md` |
| Planes de implementación por fase | `.codex/plans/README.md` y el plan de fase correspondiente |
| Operaciones de base de datos remota | `.codex/rules/database_operations.md` |
| Uso de Context7 | `.codex/rules/context7_mcp.md` |
| Laravel Boost y starter kit | `.codex/rules/laravel_boost.md`, `AGENTS.md` |
| Seguridad, privacidad y datos sensibles | `.codex/rules/security_privacy.md` |
| Calidad, lint, tests y validación | `.codex/rules/quality_testing.md`, `.codex/workflows/validation_commands.md` |
| Arquitectura general | `.codex/architecture/system_architecture.md` |
| Backend Laravel/API | `.codex/architecture/backend_laravel.md` |
| Frontend React/Inertia | `.codex/architecture/frontend_inertia_react.md` |
| Base de datos/PostGIS | `.codex/architecture/database_postgis.md` |
| Android híbrido/Capacitor | `.codex/architecture/mobile_capacitor_android.md` |
| Offline, SQLite y sincronización | `.codex/architecture/offline_sync.md` |
| Mapas, rutas y geodatos | `.codex/architecture/maps_routing.md` |
| Asistente Laravel/OpenAI | `.codex/domain/chatbot_ia.md`, `.codex/plans/17_agente_laravel_openai.md` |
| Usuarios y autenticación | `.codex/domain/users_auth.md` |
| Rutas ciclistas | `.codex/domain/routes.md` |
| POIs | `.codex/domain/pois.md` |
| Incidencias | `.codex/domain/incidents.md` |
| GPS y recorridos | `.codex/domain/gps_tracks.md` |
| Valoraciones y comentarios | `.codex/domain/ratings_comments.md` |
| shadcn/ui en Laravel | `.codex/frontend-components/shadcn_laravel.md`, `.codex/frontend-components/ui_rules.md` |
| Diseño mobile first | `.codex/frontend-components/mobile_first_patterns.md` |
| Orden sugerido de implementación | `.codex/workflows/implementation_order.md` |
| Criterios de aceptación | `.codex/testing/acceptance_checklist.md` |

## 4. Reglas de arquitectura del proyecto

- El producto es una **app híbrida Android**, no una PWA pura.
- El código principal vive en la raíz de este repositorio.
- El backend será Laravel como monolito modular con API REST.
- El frontend será React + Inertia + TypeScript + Vite.
- La app Android se empaquetará con Capacitor.
- La base de datos objetivo es PostgreSQL + PostGIS.
- El modo offline requiere SQLite local, filesystem y cola de sincronización.
- El chatbot es una frontera nativa Laravel/OpenAI: Laravel recupera datos públicos vivos, valida el contrato de respuesta y nunca expone la clave al frontend ni al APK. La proyección vectorial solo se habilita después de un preflight pgvector correcto.
- No se deben hardcodear claves de IA, mapas, APIs, webhooks ni credenciales en frontend o APK.

## 5. Reglas para trabajar en este repositorio

- Respeta el starter kit instalado: Laravel 13, React, Inertia, Fortify, Pest, Wayfinder, Tailwind v4 y Laravel Boost.
- Antes de tocar código Laravel/React, lee este `AGENTS.md`.
- Usa comandos Artisan para crear modelos, migraciones, tests, requests, resources y clases cuando aplique.
- Usa Pest para pruebas.
- Usa Wayfinder para rutas tipadas del frontend cuando corresponda.
- No agregues dependencias sin justificarlo y sin autorización del usuario.
- Mantén controladores delgados; usa Actions/Services cuando la lógica crezca.
- Usa Form Requests o validación consistente para entradas del usuario.
- Usa Policies/Gates/Middleware para autorización.

## 6. Reglas de frontend

- Mobile first siempre.
- Reutiliza componentes existentes antes de crear nuevos.
- Para shadcn/ui, sigue `.codex/frontend-components/ui_rules.md`.
- Usa tokens semánticos de Tailwind/shadcn; evita colores hardcodeados salvo necesidad justificada.
- Evita `space-x-*` y `space-y-*`; prefiere `gap-*`.
- Usa `Field`, `FieldGroup`, `Card`, `Badge`, `Alert`, `Skeleton`, `Empty`, `Dialog`, `Sheet` y demás componentes shadcn cuando aplique.

## 7. Reglas de validación antes de finalizar cambios

Según el tipo de cambio, ejecuta lo mínimo necesario:

- PHP formato: `composer lint` o `vendor/bin/pint --dirty --format agent`.
- PHP tests: `php artisan test --compact` o filtro específico.
- Tipos frontend: `npm run types:check`.
- Lint frontend: `npm run lint:check`.
- Formato frontend: `npm run format:check`.
- Build frontend si cambias Vite/assets críticos: `npm run build`.

No afirmes que algo pasó si no ejecutaste el comando y viste el resultado.

Consulta además `docs/quality/definition-of-done.md`. Para cambios de frontend usa `docs/quality/frontend-checklist.md`; para rendimiento mide antes/después siguiendo `docs/quality/performance.md`.

## 8. Regla obligatoria de progreso

- Antes de comenzar una tarea grande, revisa `.codex/progress/current_status.md`, `.codex/progress/phases.md` y `.codex/plans/README.md`.
- Si la tarea corresponde a una fase, lee y actualiza el plan `.codex/plans/*.md` correspondiente.
- Cuando completes, bloquees o cambies el estado de una fase/tarea, actualiza los archivos de `.codex/progress/`.
- Registra decisiones relevantes en `.codex/progress/decisions_log.md`.
- Registra un resumen breve de la sesión en `.codex/progress/session_log.md`.

## 9. Operaciones de base de datos

- Regla obligatoria: **no usar seeders para llenar datos de producción en cada deploy**.
- En Dokploy, `RUN_SEEDERS=false` o sin definir.
- Los seeders quedan solo como herramienta de desarrollo/testing o carga intencional, no como flujo normal.
- Para datos reales de la BD —catálogos, rutas, POIs, valores iniciales, contenido completo— se hace **directo en la BD de producción**.
- Para cambios de estructura —schema, tablas, columnas, índices, relaciones— se usan **migraciones Laravel**. Eso no se debe hacer directo a mano salvo emergencia justificada.
- Resumen operativo: `Schema/tablas/columnas → migraciones`; `Datos reales de producción → directo en BD`; `Datos de prueba/local → seeders/factories`; `Deploy normal → sin seeders`.
- La base objetivo es PostgreSQL/PostGIS remota; consulta `.codex/rules/database_operations.md`.
- No guardes contraseñas ni secretos en el repo, frontend ni APK.
- Si la tarea actual ya solicita aplicar cambios de BD, no pidas una segunda confirmación; aplica los cambios mediante el mecanismo configurado y registra el progreso.

## 10. Convenciones de documentación

- `docs/` concentra el método transversal: especificaciones nuevas, arquitectura, calidad, seguridad, ADRs y deuda técnica.
- `.codex/` es el conocimiento operativo detallado de Guaranda Go: reglas, dominio, arquitectura específica, planes y progreso. No trasladar ni duplicar en masa su historial a `docs/`.
- Si cambia una funcionalidad, actualiza la fuente de verdad más cercana y sus enlaces derivados. No entierres una decisión duradera solo en una conversación o commit.
- Si cambia una decisión arquitectónica importante, actualiza el archivo `.codex/` correspondiente y, si afecta el producto, también `README.md`.
- Mantén cada archivo `.codex` enfocado en una sola responsabilidad.

## 11. Procedimientos reutilizables

Cuando el cambio lo requiera, usa los procedimientos de `.agents/skills/`:

- `implement-feature`: funcionalidad o cambio de comportamiento.
- `create-migration`: schema, migraciones o transformación de datos.
- `implement-operational-frontend`: pantallas CRUD, administración, navegación o workflows móviles.
- `harden-security`: fronteras no confiables, auth, autorización, archivos o integraciones.
- `optimize-performance`: regresiones, profiling o presupuestos de rendimiento.
- `review-code`: revisión de bugs, seguridad, arquitectura, pruebas y documentación.
- `update-documentation`: contratos, reglas, decisiones y contexto.
- `commit-changes`: preparar commits/PR cuando el usuario lo haya solicitado.

Estos procedimientos complementan —no reemplazan— los skills Laravel/React/Fortify/Pest/Tailwind/Wayfinder ya disponibles.
