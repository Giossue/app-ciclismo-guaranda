# Sistema de componentes

## Jerarquía

1. Reutiliza primitives de `resources/js/components/ui/`.
2. Reutiliza componentes de dominio ya existentes (`routes/route-map`, carga de imágenes, navegación, tabs móviles).
3. Extrae un componente compartido solo cuando el contrato, accesibilidad y comportamiento se repitan en más de una pantalla.

Antes de añadir o actualizar un componente shadcn, consulta el skill `shadcn`, ejecuta `npx shadcn@latest info --json` y revisa `npx shadcn@latest docs <componente>`. Los cambios upstream se inspeccionan con `--dry-run` y `--diff`; nunca se sobrescriben componentes locales sin autorización explícita.

## Contratos compartidos

- Estados: `Badge` semántico con texto, no solo color — solo existen `default` (sólido, estado vigente o dato que exige atención) y `outline` (neutro); `Alert` para riesgo que permanece; `Skeleton` para carga; `Empty` para ausencia de datos.
- Formularios: `Field`/`FieldGroup`, label visible, ayuda breve, error localizado y estado disabled/pending.
- Superficies: una página tiene jerarquía clara; no anidar Cards como sustituto de layout.
- Overlay: `Dialog` para decisión breve en desktop, `Sheet` cuando el patrón móvil/espacio lo favorezca; siempre título accesible y foco correcto.
- Iconografía: tamaño único `--icon-size` (1rem) para todo icono, garantizado por la regla base `svg.lucide` de `resources/css/app.css`; en marcado se declara `size-4`. Detalle y excepciones en `.codex/frontend-components/ui_rules.md`.
- Feedback: Sonner para resultados transitorios, no para explicar una pantalla ni sustituir errores de campo.

Un cambio a un contrato reutilizado requiere revisar las pantallas consumidoras, tipos y checklist frontend.

## Componentes para agentes

Los componentes fuente de AI Elements viven en `resources/js/components/ai-elements/`. Están disponibles `attachments`, `conversation`, `message`, `prompt-input`, `suggestion`, `sources`, `reasoning`, `tool` y `confirmation`, junto con `code-block` y `shimmer` como dependencias internas.

- Son una capa de presentación React y no definen el proveedor, transporte ni persistencia del agente.
- No están conectados al chat vigente. Integrarlos exige primero definir el nuevo contrato de mensajes, adjuntos, fuentes, tools, aprobaciones y streaming.
- El registry `@ai-elements` queda declarado en `components.json`. Antes de actualizar un componente se debe ejecutar `--dry-run` y revisar el diff; los targets upstream orientados a Next.js deben reubicarse bajo `resources/js/components/ai-elements/` y nunca sobrescribir primitives locales.
- Los defaults visibles se mantienen en español, los estados usan tokens semánticos y las acciones de adjuntos permanecen visibles en móvil.
