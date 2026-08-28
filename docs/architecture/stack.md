# Stack real

| Capa | Tecnología y decisión |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+, monolito modular y API REST. |
| Web/UI | React 19, Inertia 3, TypeScript, Vite, Tailwind v4 y shadcn/ui. |
| Auth | Fortify/Laravel, con verificación de correo, 2FA, passkeys y confirmación de contraseña. |
| Datos | PostgreSQL + PostGIS en producción; Eloquent y migraciones Laravel son la fuente de schema. |
| Móvil | Capacitor 8 para Android 13+; plugins de GPS, cámara, SQLite, archivos, red y notificaciones. |
| Mapas | Leaflet, OpenStreetMap/Nominatim y paquetes offline planificados. |
| Asistente | Laravel + OpenAI Responses, contexto público vivo y AI Elements. |
| Async | Laravel Jobs + Redis cuando una operación deba ser asíncrona/reintentable. |
| Calidad | Pest 4, Pint, Larastan, ESLint, Prettier, TypeScript y builds Vite/Capacitor. |

Usa `npm` porque este repositorio tiene `package-lock.json` y scripts npm; no introduzcas pnpm/Corepack por copiar la referencia. Consulta `.codex/project/stack_decisions.md` para decisiones extendidas.

## Documentación de herramientas

- **Context7:** para APIs/configuraciones actuales de Laravel, React, Inertia, Tailwind, Capacitor, Leaflet, PostGIS, OpenAI y servicios externos. Resolver primero el ID de librería y luego consultar; nunca compartir secretos o URLs privadas.
- **shadcn/ui:** para inspeccionar componentes, APIs y registries con el CLI del proyecto. El skill `shadcn` determina composición, accesibilidad, tokens y la forma segura de añadir/actualizar componentes.
