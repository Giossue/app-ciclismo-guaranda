# AGENTS.md — Router de conocimiento para Guaranda Go

Este archivo es el punto de entrada para cualquier agente que trabaje en este repositorio. Antes de implementar, modificar o revisar código, usa este router para cargar el contexto correcto desde `.codex/` y desde la aplicación Laravel ubicada en `ciclismo-guaranda/`.

## 1. Contexto base obligatorio

Siempre considera estos archivos como fuente principal:

1. `README.md` — especificación completa del producto Guaranda Go.
2. `.codex/README.md` — mapa de carpetas de conocimiento.
3. `ciclismo-guaranda/AGENTS.md` — reglas generadas por Laravel Boost para el proyecto Laravel/React.

Si hay conflicto entre documentos:

1. La petición actual del usuario tiene prioridad.
2. Luego `AGENTS.md` de la raíz.
3. Luego `README.md`.
4. Luego los documentos específicos de `.codex/`.
5. Luego reglas generadas dentro de `ciclismo-guaranda/AGENTS.md`, especialmente para Laravel Boost, estilo, tests y paquetes instalados.

## 2. Regla obligatoria: MCP Context7

El agente tiene a disposición el MCP de **Context7** para consultar documentación actualizada de librerías, frameworks y herramientas.

Reglas:

- Usa Context7 cuando necesites documentación actualizada de librerías externas o APIs: Capacitor, Leaflet, shadcn/ui, React, Inertia, Laravel, PostGIS, TileServer GL, OSRM, GraphHopper, OpenRouteService, n8n, etc.
- Primero resuelve el ID de librería con `resolve-library-id` y luego consulta con `query-docs`.
- No inventes APIs, métodos, parámetros ni configuraciones cuando se puedan verificar con Context7.
- Para paquetes Laravel instalados en `ciclismo-guaranda`, si Laravel Boost está disponible, prioriza sus herramientas/documentación específica del proyecto. Usa Context7 como apoyo cuando Boost no cubra la duda o cuando sea una librería externa.
- No incluyas secretos, tokens, credenciales ni URLs privadas al consultar documentación.

Ver también: `.codex/rules/context7_mcp.md`.

## 3. Router por tipo de tarea

| Si la tarea trata sobre... | Lee primero |
|---|---|
| Visión general, alcance, stack y decisiones | `README.md`, `.codex/project/product_context.md`, `.codex/project/stack_decisions.md` |
| Límites del sistema y qué no construir | `.codex/project/scope_boundaries.md` |
| Reglas generales de desarrollo | `.codex/rules/project_rules.md` |
| Seguimiento de progreso por fases | `.codex/rules/progress_tracking.md`, `.codex/progress/current_status.md`, `.codex/progress/phases.md` |
| Planes de implementación por fase | `.codex/plans/README.md` y el plan de fase correspondiente |
| Operaciones de base de datos remota | `.codex/rules/database_operations.md` |
| Uso de Context7 | `.codex/rules/context7_mcp.md` |
| Laravel Boost y starter kit | `.codex/rules/laravel_boost.md`, `ciclismo-guaranda/AGENTS.md` |
| Seguridad, privacidad y datos sensibles | `.codex/rules/security_privacy.md` |
| Calidad, lint, tests y validación | `.codex/rules/quality_testing.md`, `.codex/workflows/validation_commands.md` |
| Arquitectura general | `.codex/architecture/system_architecture.md` |
| Backend Laravel/API | `.codex/architecture/backend_laravel.md` |
| Frontend React/Inertia | `.codex/architecture/frontend_inertia_react.md` |
| Base de datos/PostGIS | `.codex/architecture/database_postgis.md` |
| Android híbrido/Capacitor | `.codex/architecture/mobile_capacitor_android.md` |
| Offline, SQLite y sincronización | `.codex/architecture/offline_sync.md` |
| Mapas, rutas y geodatos | `.codex/architecture/maps_routing.md` |
| Integración con n8n/IA | `.codex/architecture/n8n_webhook_agent.md` |
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
- El código principal vive en `ciclismo-guaranda/`.
- El backend será Laravel como monolito modular con API REST.
- El frontend será React + Inertia + TypeScript + Vite.
- La app Android se empaquetará con Capacitor.
- La base de datos objetivo es PostgreSQL + PostGIS.
- El modo offline requiere SQLite local, filesystem y cola de sincronización.
- El chatbot no es nativo: se consume un webhook externo de n8n y se muestra/procesa el JSON de `Respond to Webhook`.
- No se deben hardcodear claves de IA, mapas, APIs, webhooks ni credenciales en frontend o APK.

## 5. Reglas para trabajar en `ciclismo-guaranda/`

- Respeta el starter kit instalado: Laravel 13, React, Inertia, Fortify, Pest, Wayfinder, Tailwind v4 y Laravel Boost.
- Antes de tocar código Laravel/React, lee `ciclismo-guaranda/AGENTS.md`.
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

- `.codex/` es conocimiento para agentes, no documentación de usuario final.
- Si cambia una decisión arquitectónica importante, actualiza el archivo `.codex/` correspondiente y, si afecta el producto, también `README.md`.
- Mantén cada archivo `.codex` enfocado en una sola responsabilidad.
