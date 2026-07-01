# Fase 16 - Refactor frontend mobile first integral

Estado: Completado

## Objetivo

Rediseñar de forma integral el frontend de Guaranda Go para que toda la aplicación funcione como web app móvil de alta calidad dentro de Android/WebView, cubriendo autenticación, ciclista, administrador, ajustes, formularios, mapas, modales, tabs, badges, botones, inputs y toasts.

## Lectura de diseño

App operativa de cicloturismo y administración en campo. Prioridad absoluta: móvil, lectura bajo luz exterior, controles táctiles grandes, mapas como superficie principal y flujos cortos. No se debe sentir como dashboard desktop reducido.

## Stitch

- Proyecto Stitch previo: `projects/6540137781896183848` (`Guaranda Go - Mobile UI Refactor`).
- Design system Stitch previo: `assets/8743915527678384604` (`Guaranda Go - Andean Field UI`).
- Dirección anterior descartada por feedback del usuario.
- Dirección visual actual: clonar el frontend de `https://github.com/Giossue/ciclismo-ueb`, usando solo su capa visual y adaptándola a React/Inertia/shadcn sin copiar lógica Angular.

## Inventario actual del frontend

Ubicación principal: `ciclismo-guaranda/resources/js/`.

Estructura relevante:

```txt
resources/js/
├── app.tsx
├── components/
│   ├── admin/
│   ├── routes/
│   └── ui/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
├── types/
└── wayfinder/
```

Resumen del scanner `temp/analyze_frontend.py`:

- 226 archivos JS/TS/CSS analizados.
- 32 páginas Inertia.
- 56 componentes React.
- 9 layouts.
- 25 componentes shadcn/ui presentes.
- `sonner` ya está instalado y montado en `resources/js/app.tsx`.
- Toast global actual existe, pero debe ajustarse a móvil: bottom-center, above bottom nav.
- No hay tablas React detectadas; admin ya se basa principalmente en cards/listas.
- Componentes más usados: `Button`, `Label`, `Card`, `Input`, `Badge`, `Select`, `Alert`, `Dialog`, `Sheet`.

## Pantallas cubiertas obligatoriamente

### Root

- `pages/welcome.tsx`

### Auth

- `pages/auth/login.tsx`
- `pages/auth/register.tsx`
- `pages/auth/forgot-password.tsx`
- `pages/auth/reset-password.tsx`
- `pages/auth/confirm-password.tsx`
- `pages/auth/two-factor-challenge.tsx`
- `pages/auth/verify-email.tsx`

### Ciclista

- `pages/routes/index.tsx`
- `pages/routes/show.tsx`
- `pages/tracks/show.tsx`
- `pages/favorites/index.tsx`
- `pages/chat/index.tsx`
- `pages/menu/index.tsx`

### Ajustes y cuenta

- `pages/settings/profile.tsx`
- `pages/settings/security.tsx`
- `pages/settings/appearance.tsx`
- Componentes relacionados: passkeys, 2FA, eliminar usuario, menú de usuario.

### Admin

- `pages/admin/dashboard.tsx`
- `pages/admin/users/index.tsx`
- `pages/admin/routes/index.tsx`
- `pages/admin/routes/create.tsx`
- `pages/admin/routes/edit.tsx`
- `pages/admin/routes/partials/route-form.tsx`
- `pages/admin/pois/index.tsx`
- `pages/admin/pois/create.tsx`
- `pages/admin/pois/edit.tsx`
- `pages/admin/pois/partials/poi-form.tsx`
- `pages/admin/incidents/index.tsx`
- `pages/admin/ratings/index.tsx`
- `pages/admin/catalogs/index.tsx`
- `pages/admin/statistics/index.tsx`
- `pages/admin/settings/index.tsx`

### Componentes transversales

- `components/app-mobile-nav.tsx`
- `components/app-sidebar.tsx`
- `components/app-sidebar-header.tsx`
- `components/app-header.tsx`
- `components/mobile-tabs.tsx`
- `components/routes/route-map.tsx`
- `components/admin/routes/route-geometry-editor.tsx`
- `components/ui/*`

## Principios de refactor

- Mantener rutas, props, autorización, nombres de campos, validaciones y lógica de negocio.
- Cambiar primero sistema visual base, luego pantallas.
- Mobile first real: una columna, target táctil mínimo 44px, bottom nav cuidando safe area.
- Admin móvil con cards accionables, filtros en sheet y formularios por bloques.
- No introducir dependencias nuevas sin autorización.
- Usar `sonner` ya instalado.
- Usar tokens semánticos en `resources/css/app.css`; evitar colores Tailwind hardcodeados en páginas.
- Labels visibles sobre inputs. No placeholder como label.
- Modales móviles como `Sheet` o bottom sheet; `Dialog` solo confirmaciones pequeñas.
- Tabs locales sin cambiar URL para preservar botón atrás Android.
- Mantener todo texto visible en español.

## Plan de implementación

### Bloque 1 - Sistema visual base

Archivos principales:

- `resources/css/app.css`
- `resources/js/components/ui/button.tsx`
- `resources/js/components/ui/input.tsx`
- `resources/js/components/ui/card.tsx`
- `resources/js/components/ui/badge.tsx`
- `resources/js/components/ui/dialog.tsx`
- `resources/js/components/ui/sheet.tsx`
- `resources/js/components/ui/select.tsx`
- `resources/js/components/ui/sonner.tsx`
- `resources/js/components/mobile-tabs.tsx`

Cambios:

- Recalibrar paleta a `ciclismo-ueb`: fondo #0d0f0d, superficies #151815/#1c1f1c y primario lime #b2f000.
- Ajustar radios, focus rings, alturas táctiles, estados active y disabled.
- Rediseñar badges por semántica.
- Rediseñar tabs como segmented control móvil.
- Configurar toast móvil bottom-center y offset para bottom nav.

Validación mínima:

- `npm run types:check`
- `npm run lint:check`
- `npm run format:check`

### Bloque 2 - Shell, navegación y layout

Archivos principales:

- `resources/js/app.tsx`
- `resources/js/layouts/app/app-sidebar-layout.tsx`
- `resources/js/layouts/auth/auth-simple-layout.tsx`
- `resources/js/layouts/settings/layout.tsx`
- `resources/js/components/app-mobile-nav.tsx`
- `resources/js/components/app-sidebar.tsx`
- `resources/js/components/app-sidebar-header.tsx`
- `resources/js/components/nav-main.tsx`
- `resources/js/components/nav-user.tsx`
- `resources/js/components/user-menu-content.tsx`

Cambios:

- Bottom nav más táctil, seguro para WebView Android y con estado activo claro.
- Header móvil compacto por módulo.
- Sidebar desktop coherente, pero no dominante.
- Ajustar padding inferior global por bottom nav y safe area.

### Bloque 3 - Auth completo

Pantallas:

- Login, registro, recuperar, reset, confirm password, 2FA, verify email.

Cambios:

- Auth como pantalla móvil premium y rápida.
- Registro con secciones claras y checklist de contraseña consistente.
- Inputs y errores con jerarquía legible.
- Acciones primarias full width en móvil.

### Bloque 4 - Ciclista completo

Pantallas:

- Rutas, detalle, recorrido activo, favoritos, chat, menú.

Cambios:

- Ruta cards más visuales y accionables.
- Mapa con chips de estado GPS/offline e incidencias.
- Detalle con tabs locales refinados.
- Recorrido activo prioriza mapa, métricas y acciones críticas.
- Chat como mensajería móvil con historial en sheet y toasts de estado.
- Favoritos y menú sin duplicar navegación inferior.

### Bloque 5 - Admin completo

Pantallas:

- Dashboard, usuarios, rutas CRUD, POIs CRUD, incidencias, valoraciones, catálogos, estadísticas, configuración.

Cambios:

- Admin móvil como consola de campo, no tabla desktop.
- Cards con acciones claras, filtros plegables o sheet.
- Formularios largos divididos por bloques.
- Formularios de rutas/POIs con mapa y adjuntos más claros.
- Estados administrativos con badges semánticos.

### Bloque 6 - Ajustes, seguridad y cuenta

Pantallas:

- Perfil, seguridad, apariencia, passkeys, 2FA, eliminar cuenta.

Cambios:

- Formularios agrupados y legibles.
- Modales de seguridad como confirmaciones claras.
- Apariencia integrada al nuevo sistema visual.

### Bloque 7 - Estados transversales

Cambios:

- Skeletons donde haya carga diferida.
- Empty states coherentes para listas vacías.
- Alertas offline/GPS/sync consistentes.
- Toasts para éxito, error transitorio, sincronización y conexión.

### Bloque 8 - Auditoría final

Checklist:

- Ninguna página Inertia sin revisar.
- Cero hardcodeo nuevo de color no justificado.
- Formularios con labels visibles.
- Contraste móvil aceptable en light/dark.
- Bottom nav no tapa toast, sheet ni acciones críticas.
- Mapas siguen funcionales.
- Botón atrás Android no se rompe.

Validación final:

- `npm run types:check`
- `npm run lint:check`
- `npm run format:check`
- `npm run build`
- Tests Pest relevantes si se toca integración de formularios o rutas.

## Fuera de alcance

- Cambiar lógica de negocio.
- Cambiar rutas URL o nombres de campos.
- Agregar dependencias de UI nuevas sin autorización.
- Cambios de BD.
- Reescribir backend.
- Reemplazar Leaflet.

## Criterios de aceptación

- Todas las pantallas listadas fueron revisadas y adaptadas.
- UI consistente para admin y ciclista.
- Login y registro se sienten diseñados para móvil.
- Forms, inputs, tabs, navbar, badges, botones, modales y toasts usan el nuevo sistema.
- Admin funciona bien en móvil sin tablas horizontales.
- Ciclista prioriza ruta, mapa, GPS, offline y acciones críticas.
- Validación frontend completa pasa.

## Implementación 2026-07-01

Se ejecutó el refactor integral inicial en una pasada sobre el frontend React/Inertia:

- Sistema visual global en `resources/css/app.css` con tokens Andean Field UI, safe area móvil, superficies, focus states y Leaflet.
- Componentes base shadcn rediseñados: botones, inputs, cards, badges, alerts, dialog, sheet, select, checkbox, tabs móviles y sonner.
- Toasts añadidos/mejorados: `sonner` queda bottom-center, sobre la bottom nav, con rich colors, botón de cierre y avisos online/offline.
- Shell móvil y navegación rediseñados: bottom nav táctil, header/sidebar desktop coherentes, padding inferior seguro para Android.
- Auth rediseñado con layout móvil fuerte y welcome reconstruido.
- Ajustes rediseñados con navegación segmentada móvil.
- Barrido de todas las pantallas para eliminar `space-*`, colores Tailwind hardcodeados y radios antiguos, manteniendo lógica, rutas y campos.
- Mapas actualizados para usar tokens CSS en vez de hex hardcodeados.

Validación aprobada:

- `npm --prefix ciclismo-guaranda run types:check`
- `npm --prefix ciclismo-guaranda run lint:check`
- `npm --prefix ciclismo-guaranda run format:check`
- `npm --prefix ciclismo-guaranda run build`

No hubo cambios de BD, backend ni rutas URL.


## Reimplementación 2026-07-01 - Clon visual `ciclismo-ueb`

Por feedback del usuario se reemplazó la dirección Andean Field UI por el estilo del repositorio `ciclismo-ueb`.

Cambios realizados:

- Se clonó `https://github.com/Giossue/ciclismo-ueb` en `temp/ciclismo-ueb` para analizar CSS Angular como referencia visual.
- Se copiaron fuentes `CicloSans` y assets fuente a `public/assets`, pero se conservó el icono original de la app (`/logo.svg`) como pidió el usuario.
- Se portaron tokens visuales dark/lime a `resources/css/app.css`.
- Se adaptaron base components shadcn: `Button`, `Card`, `Input`, `Badge` y estilos globales para modales, sheets, tabs, toasts, Leaflet, inputs y cards.
- Se rediseñó shell mobile first: bottom nav plana tipo `ciclismo-ueb`, layout scrollable seguro, sidebar desktop oscuro y navegación activa lime.
- Se rediseñó auth/welcome con composición móvil, montañas SVG y `CicloSans`.
- Se rediseñó `routes/index` con cards compactas tipo fuente, chips horizontales y miniaturas.
- Se rediseñó `chat/index` con header, subheader, burbujas y footer de input tipo fuente.
- Admin y resto de pantallas quedan cubiertas por tokens/componentes/layout global, sin cambios de lógica ni rutas.

Validación aprobada:

- `npm --prefix ciclismo-guaranda run format`
- `npm --prefix ciclismo-guaranda run format:check`
- `npm --prefix ciclismo-guaranda run types:check`
- `npm --prefix ciclismo-guaranda run lint:check`
- `npm --prefix ciclismo-guaranda run build`

Notas:

- El build muestra advertencia no bloqueante de Vite sobre fuentes en `/assets/fonts/*.ttf`; quedan como URLs públicas runtime, coherente con archivos en `public/assets/fonts`.
- No hubo cambios de backend, BD, rutas URL ni lógica de formularios.
