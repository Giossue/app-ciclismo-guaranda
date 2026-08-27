# Sistema de componentes

## Jerarquía

1. Reutiliza primitives de `resources/js/components/ui/`.
2. Reutiliza componentes de dominio ya existentes (`routes/route-map`, carga de imágenes, navegación, tabs móviles).
3. Extrae un componente compartido solo cuando el contrato, accesibilidad y comportamiento se repitan en más de una pantalla.

Antes de añadir o actualizar un componente shadcn, consulta el skill `shadcn`, ejecuta `npx shadcn@latest info --json` y revisa `npx shadcn@latest docs <componente>`. Los cambios upstream se inspeccionan con `--dry-run` y `--diff`; nunca se sobrescriben componentes locales sin autorización explícita.

## Contratos compartidos

- Estados: `Badge` semántico con texto, no solo color; `Alert` para riesgo que permanece; `Skeleton` para carga; `Empty` para ausencia de datos.
- Formularios: `Field`/`FieldGroup`, label visible, ayuda breve, error localizado y estado disabled/pending.
- Superficies: una página tiene jerarquía clara; no anidar Cards como sustituto de layout.
- Overlay: `Dialog` para decisión breve en desktop, `Sheet` cuando el patrón móvil/espacio lo favorezca; siempre título accesible y foco correcto.
- Feedback: Sonner para resultados transitorios, no para explicar una pantalla ni sustituir errores de campo.

Un cambio a un contrato reutilizado requiere revisar las pantallas consumidoras, tipos y checklist frontend.
