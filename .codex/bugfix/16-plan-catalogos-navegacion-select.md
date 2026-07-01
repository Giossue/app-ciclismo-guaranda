# 16 — Plan: navegación de catálogos mediante select

## Estado

Pendiente de aprobación.

## Feedback recibido

- En catálogos, actualmente hay que bajar demasiado para ver una sección.
- La navegación de catálogos debe ser mediante select.

## Observación técnica actual

- `resources/js/pages/admin/catalogs/index.tsx` renderiza todos los catálogos uno debajo de otro.
- Cada catálogo tiene formulario de creación y formularios de edición para todos sus registros.
- Esto provoca una pantalla larga y difícil de navegar en móvil.

## Plan propuesto

### 1. Selector de catálogo activo

- Agregar un `Select` en la parte superior:
  - placeholder: “Selecciona un catálogo”.
  - opciones: roles, estados, categorías, tipos, etc.
- Mostrar solo el catálogo seleccionado.
- Dejar opción “Todos” solo si se considera útil, pero por defecto mostrar uno para reducir scroll.

### 2. Resumen superior

- Mantener badges de total de catálogos y registros.
- Agregar descripción del catálogo seleccionado:
  - título,
  - tabla,
  - si es base del sistema,
  - si es activable.

### 3. Navegación mobile first

- En móvil, el select queda sticky o visible cerca del encabezado.
- Al cambiar catálogo, hacer scroll al inicio de la sección para no dejar al usuario perdido.
- Mantener formularios con cards y gaps, no tablas grandes.

### 4. Deep link opcional

- Usar query param `?catalog=poi-categories` para poder enlazar una sección específica.
- Al abrir con query param, seleccionar ese catálogo automáticamente.
- Evitar perder estado al guardar: `preserveScroll` o redirección con catálogo activo si se implementa backend.

## Archivos que se tocarían después de aprobar

- `resources/js/pages/admin/catalogs/index.tsx`.
- Posiblemente `app/Http/Controllers/Admin/CatalogController.php` si se usa query param desde backend.
- Tests si existen para catálogos.

## Datos/BD

- No requiere migración ni cambios de datos.

## Criterios de aceptación

- Admin puede elegir el catálogo desde un select.
- No tiene que hacer scroll por todos los catálogos para editar uno.
- En móvil se entiende qué catálogo está activo.
- Crear/editar registros sigue funcionando igual.

## Validación mínima cuando se implemente

- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Test manual: cambiar catálogo, crear registro, editar registro y volver al catálogo seleccionado.

## Avance implementado

- Catálogos admin ahora tienen selector superior y muestran solo el catálogo activo para reducir scroll.
