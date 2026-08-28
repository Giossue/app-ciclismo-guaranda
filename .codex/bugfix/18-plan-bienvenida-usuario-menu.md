# 18 — Plan: bienvenida con nombre completo en header y menú

## Estado

Pendiente de aprobación.

## Feedback recibido

- Agregar una bienvenida con el nombre completo del usuario.
- Que se muestre igual en `Menú`.

## Observación técnica actual

- `resources/js/components/app-header.tsx` muestra logo, navegación y avatar.
- El menú de usuario usa `UserMenuContent` y `UserInfo`.
- El avatar usa `auth.user?.name`, pero no se muestra una bienvenida explícita en header.
- El menú móvil tipo Sheet lista navegación, pero no muestra saludo personalizado arriba.

## Plan propuesto

### 1. Nombre completo

- Construir helper de display name con:
  - `name`,
  - `last_name` si está disponible en `auth.user`.
- Si `last_name` no llega al frontend, ajustar el tipo/serialización compartida para incluirlo.
- Fallback: mostrar solo `name`.

### 2. Header desktop/tablet

- Mostrar saludo corto cerca del avatar o antes del avatar:
  - “Hola, Nombre Apellido”.
- En móvil, evitar saturar barra superior; puede quedar solo en menú.

### 3. Menú móvil / Sheet

- En el `SheetContent` del menú, mostrar bloque superior:
  - avatar/iniciales,
  - “Bienvenido/a”,
  - nombre completo,
  - rol o acceso principal si aplica.
- Mantener navegación debajo.

### 4. Dropdown de usuario

- En `UserMenuContent`, asegurar que el nombre completo se vea arriba.
- Evitar duplicar email si no aporta; pero mantenerlo si ya es útil en ajustes/cuenta.

## Archivos que se tocarían después de aprobar

- `resources/js/components/app-header.tsx`.
- `resources/js/components/user-menu-content.tsx`.
- `resources/js/components/user-info.tsx`.
- Tipos en `resources/js/types` si falta `last_name`.
- Middleware/shared props de Inertia si no se comparte apellido.

## Datos/BD

- No requiere migración. `last_name` ya existe en usuarios según el dominio actual.

## Criterios de aceptación

- Usuario ve “Hola/Bienvenido, Nombre Apellido” en desktop/tablet.
- En móvil, el menú muestra bienvenida con nombre completo.
- Dropdown de usuario mantiene nombre legible.
- Si no hay apellido, no se rompe la UI.

## Validación mínima cuando se implemente

- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Revisión manual en admin y ciclista, desktop y móvil.

## Avance implementado

- Header muestra saludo con nombre completo.
- Menú móvil muestra bloque de bienvenida con usuario.
- Dropdown usa nombre completo en `UserInfo`.
