# Frontend React + Inertia

## Contrato de implementación

- TypeScript estricto, React/Inertia y rutas Wayfinder en vez de URLs hardcodeadas para llamadas al backend.
- Reutilizar componentes de `resources/js/components/ui/` y patrones existentes antes de crear variantes.
- Mobile first para Android: acciones táctiles grandes, buen contraste exterior, navegación inferior en móvil y sidebar en desktop/tablet.
- Usar `Field`/`FieldGroup`, `Dialog`/`Sheet`, `Alert`, `Badge`, `Skeleton`, `Empty` y Sonner según el patrón existente.
- Cada mutación debe comunicar pendiente, éxito o error; validaciones correctables se muestran junto al campo.
- Pantallas de listas manejan carga, vacío, vacío filtrado, error, permisos, contenido largo y solicitudes lentas.
- Para shadcn/ui, primero consulta el skill y ejecuta `npx shadcn@latest info --json`; usa componentes instalados/variantes antes de crear markup personalizado. Antes de usar o modificar un componente, revisa su API con `npx shadcn@latest docs <componente>`.
- Para APIs de librerías externas, usa Context7 (resolver ID y luego consultar documentación) antes de asumir métodos, opciones o configuraciones. Laravel Boost tiene prioridad para paquetes Laravel instalados.

## Evitar

- IDs, paths de storage, nombres de proveedor o implementación visibles para ciclistas.
- Cards anidadas, encabezados repetidos, banners permanentes de éxito y navegación de tercer nivel.
- Lógica de negocio o secretos en componentes; aislar GPS, red, offline y nativo en hooks/servicios.

Consulta los patrones de `docs/architecture/` y `.codex/frontend-components/`; activa los skills `inertia-react-development`, `tailwindcss-development`, `shadcn` y `wayfinder-development` si su disparador aplica.
