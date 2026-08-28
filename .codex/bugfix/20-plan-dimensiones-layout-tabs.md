# 20 — Plan: dimensiones de vistas, nav inferior y tabs

## Estado

Implementado 2026-07-01.

## Feedback recibido

- En escritorio el contenido del cuerpo toca el sidebar (sin margen).
- La barra de navegación inferior (móvil) se come espacio del contenido.
- Los tabs del usuario (Mapa, Ruta, POIs, Reportar, Opiniones, Sin conexión) se
  ven mal (apretados y con scrollbar).

## Causas

- El `<main>` de `layouts/app/app-sidebar-layout.tsx` tenía `w-full` (utilities
  gana sobre `ueb-admin-page` de components) y `px-0`, así que el contenido iba a
  todo el ancho pegado al sidebar.
- El mismo `<main>` tenía `py-[var(--page-pad-y)]`, que sobreescribía el
  `padding-bottom` de `.safe-bottom-pad` → el contenido quedaba debajo de la nav
  fija en móvil.
- `MobileTabs` usaba `min-w-24` por tab; con 6 tabs se desbordaban con scrollbar
  visible.

## Cambios

- `app-sidebar-layout.tsx`: `<main>` ahora es
  `mx-auto max-w-[var(--page-max-admin)]` con `px-[var(--page-pad-x)]`,
  `pt-[var(--page-pad-y)]` y `safe-bottom-pad` (con `md:pb-[var(--page-pad-y)]`
  para no dejar espacio extra en escritorio donde la nav está oculta). Así el
  cuerpo tiene margen del sidebar y el contenido no queda tapado por la nav.
- `app.css`: `.ueb-page` y `.ueb-admin-page` pasan a `width:100%` +
  `max-width` + `margin-inline:auto` (el padding horizontal lo da el `main`),
  evitando doble margen.
- `mobile-tabs.tsx`: tabs compactos (sin `min-w-24`, `px-3.5`, `min-h-10`) y
  scroll horizontal con scrollbar oculto.

## Validación

- `npm run types:check`, `lint:check`, `format:check` y `build` pasan.

## Pendiente

- Commit + push + redeploy para verlo en producción.
