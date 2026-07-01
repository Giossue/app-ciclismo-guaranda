# 13 — Plan: contraste, tema visual y botones legibles

## Estado

Pendiente de aprobación.

## Feedback recibido

- Varios botones no se ven blancos/legibles; algunos quedan negros y difíciles de leer.
- El tema claro/oscuro se siente plano: “todo completamente oscuro o todo completamente negro”.
- Se necesita más profundidad visual: fondos, cards, superficies y botones con jerarquía.

## Observación técnica actual

- `resources/css/app.css` usa tokens shadcn base muy neutros.
- En modo oscuro:
  - `--background`, `--card` y `--popover` tienen valores muy similares (`oklch(0.145 0 0)`), por eso todo se ve plano.
  - `--primary` es casi blanco y `--primary-foreground` oscuro; esto genera botones principales blancos en dark mode, pero puede verse inconsistente con la marca.
  - `--sidebar-primary-foreground` actualmente es casi blanco sobre `--sidebar-primary` casi blanco, posible bajo contraste.
- `resources/js/components/ui/button.tsx` usa variantes shadcn estándar:
  - `default`: `bg-primary text-primary-foreground`.
  - `outline`: `bg-background` + hover accent.
  - `secondary`: `bg-secondary text-secondary-foreground`.
  - `destructive`: `bg-destructive text-white`.
- Hay clases explícitas `text-black`, `text-white`, `bg-black`, `bg-white`, `bg-red-600` dispersas en componentes. Algunas son intencionales para overlays, pero otras pueden romper consistencia del tema.

## Principio de diseño propuesto

No hacer “todo negro” ni “todo blanco”. Usar sistema de superficies:

### Claro

- Fondo general: blanco cálido o gris muy suave.
- Cards: blanco real o superficie levemente elevada.
- Bordes: gris suave pero visible.
- Primario: color de marca/acción con texto claramente contrastado.
- Outline: fondo transparente/superficie, borde visible, texto legible.

### Oscuro

- Fondo general: off-black, no negro puro.
- Cards: un nivel más claro que el fondo.
- Popovers/menus: otro nivel ligeramente elevado.
- Bordes: visibles sin ser brillantes.
- Primario: color de acción consistente, no depender únicamente de blanco puro.
- Texto secundario: suficiente contraste para exterior/luz solar.

## Plan propuesto

### 1. Auditoría de tokens

- Revisar `resources/css/app.css` y ajustar tokens semánticos:
  - `--background`,
  - `--foreground`,
  - `--card`,
  - `--popover`,
  - `--primary`,
  - `--primary-foreground`,
  - `--secondary`,
  - `--muted`,
  - `--accent`,
  - `--border`,
  - `--input`,
  - tokens de sidebar.
- Corregir combinaciones con bajo contraste, especialmente `sidebar-primary`/`sidebar-primary-foreground`.

### 2. Botones

- Mantener variantes shadcn, pero ajustar tokens para que todas sean legibles.
- Revisar pantallas críticas:
  - login/registro,
  - rutas index,
  - detalle de ruta,
  - offline/incidencias,
  - admin routes/pois,
  - menú/bottom navbar.
- Evitar botones negros con texto oscuro o blancos con texto claro.
- Donde se requiere botón “peligro”, mantener rojo explícito con texto blanco y contraste suficiente.

### 3. Profundidad visual

- Cards principales con `bg-card`, borde visible y sombra suave.
- Paneles secundarios con `bg-muted/30` o superficie elevada coherente.
- Estados seleccionados con `bg-primary/10` + borde `primary`, no solo color plano.
- En mapas/portadas, conservar overlays `from-black/...` porque ayudan a leer texto sobre imagen.

### 4. Limpieza de hardcodes problemáticos

- Revisar usos de:
  - `text-black`,
  - `text-white`,
  - `bg-black`,
  - `bg-white`,
  - `dark:text-white`,
  - `dark:bg-neutral-*`.
- Mantener hardcodes solo cuando tienen razón visual clara:
  - texto sobre foto oscura,
  - logo,
  - botón destructivo excepcional ya corregido.
- Cambiar el resto a tokens semánticos.

### 5. QA visual mobile first

- Probar claro y oscuro.
- Priorizar Android/exterior: contraste, tamaños de toque, lectura rápida.
- Verificar estados hover/focus aunque en móvil no se usen igual.

## Archivos que se tocarían después de aprobar

- `resources/css/app.css`.
- `resources/js/components/ui/button.tsx` si se necesita ajustar variantes.
- Componentes con hardcodes de color detectados, por ejemplo:
  - `resources/js/components/app-header.tsx`,
  - `resources/js/components/appearance-tabs.tsx`,
  - componentes de navegación/sidebar si aplica,
  - páginas de rutas si alguna clase rompe contraste.

## Datos/BD

- No requiere migración ni cambios de datos.

## Criterios de aceptación

- Botones primarios, outline, secondary, ghost y destructive son legibles en claro y oscuro.
- Cards y superficies tienen separación visual; el tema oscuro no se ve como un bloque negro plano.
- Inputs/selects tienen borde y texto legibles.
- Navegación actual, bottom navbar y sidebar mantienen estado activo reconocible.
- No se introducen colores hardcodeados innecesarios fuera de casos justificados.

## Validación mínima cuando se implemente

- `npm run types:check`.
- `npm run lint:check`.
- `npm run format:check`.
- `npm run build`.
- Revisión manual en claro/oscuro de rutas, detalle, auth, admin y menú móvil.
