# Reglas UI — shadcn/ui + Tailwind v4

## Principios

- Mobile first siempre.
- Reutilizar componentes existentes antes de crear nuevos.
- Usar shadcn/ui como base visual.
- Usar `/home/giossue/Escritorio/template-shadcn-superdashboard/` como referencia local de patrones visuales para paneles, tablas, filtros, navegación y estados. Adaptar siempre su estructura a los datos, tokens, componentes y flujos reales de Guaranda Go; no copiar métricas, gráficos, textos ni datos de demostración.
- Mantener accesibilidad: labels, alt text, focus states, títulos en diálogos/sheets.

## Reglas shadcn

- Usar `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` completos cuando aplique.
- Usar `Badge` para estados: activa, inactiva, borrador, reportada, resuelta, offline.
- Usar `Alert` para advertencias de GPS, offline, incidencias y permisos.
- Usar `Skeleton` para carga.
- Usar `Empty` para estados vacíos.
- Usar `Dialog`, `Sheet` o `Drawer` con título accesible.
- Los sheets de crear, editar, moderar o confirmar llevan un pie fijo con `Cancelar` seguido de la acción principal; el contenido debe poder desplazarse sin ocultar esos botones. Los sheets solo informativos o de navegación no requieren acción principal.
- Usar `FieldGroup` y `Field` para formularios.
- Usar `sonner` para toasts si ya está disponible.
- Para fechas, usar `DatePicker` compuesto por `Calendar` y `Popover` de shadcn; no usar `input[type="date"]`, para evitar el selector nativo del dispositivo y mantener una experiencia consistente en Android.

## Tailwind

- Evitar `space-x-*` y `space-y-*`; usar `gap-*`.
- Usar colores semánticos: `bg-background`, `text-muted-foreground`, `bg-primary`.
- Evitar colores hardcodeados salvo necesidad justificada.
- Usar `size-*` cuando ancho y alto sean iguales.
- Usar `cn()` para clases condicionales.

## Tokens visuales globales

Los estilos reutilizables se definen en `resources/css/app.css`; no crear otra fuente de verdad para radios, alturas o elevaciones.

- Radios: `--radius-tight`, `--radius-compact`, `--radius-control`, `--radius-surface`, `--radius-emphasis`, `--radius-map`, `--radius-pill` y `--radius-circle`.
- La escala no circular vigente reduce aproximadamente 30 % los radios frente a la versión anterior; cualquier ajuste futuro debe preservar esas proporciones en vez de añadir valores locales.
- Las utilidades `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` y `rounded-3xl` se enlazan a esa escala desde `@theme`.
- Primitives shadcn y controles compartidos usan el token por **tamaño de elemento**, no por tipo: `control` para todo control interactivo de ~40-52px (botón, input, textarea, trigger e ítems de select, checkbox, toggle, ítems de menú) y `surface` para superficies (card, dialog, popover, dropdown, contenido de select, alert, toast). `rounded-full` solo en píldoras y botones de icono.
- Alturas: `--control-height`, `--action-height`, `--action-height-sm` y `--action-height-lg`.
- Elevaciones: `--elevation-flat`, `--elevation-subtle`, `--elevation-raised` y `--elevation-floating`.
- Color de marca: `--primary` es **#008000** en ambos temas y funciona como **superficie** (botones, badges, selección) con `--primary-foreground` blanco; `--primary-hover` es un verde más oscuro (#007000).
- Para **texto o iconos de marca** usa `--link`/`--link-hover` (oscuros en claro, claros en oscuro) o `--brand-accent`; no uses `--primary` como color de texto porque en tema oscuro no alcanza 4.5:1 sobre el fondo.
- Si `--brand-accent` se usa como fondo, el texto va con `--brand-accent-foreground`, que invierte según el tema.
- `Badge` tiene **solo dos variantes**: `default` (sólido de marca) para el estado vigente o el dato que exige atención, y `outline` (neutro) para metadatos, taxonomías, contadores informativos y estados apagados. No se añaden variantes por color de estado: el significado lo lleva el texto del badge.
- Su métrica se escala con el token `--badge-scale` (hoy `0.77`) sobre la base del sistema: relleno, separación, tipografía e icono se calculan desde ese factor, así que para agrandar o achicar badges se toca **solo ese número**. La tipografía (`font-semibold`, `uppercase`, `tracking-[0.04em]`) vive en el componente. No redefinir badges con clases por pantalla.
- El resto de verdes (`--ring`, `--focus-ring`, `--info`, `--chart-1`, `--chart-2`, `--primary-glow`, `--sidebar-primary`) se derivan del mismo tono OKLCH (H≈142.5) variando solo luminosidad; `--success`, `--warning` y `--destructive` siguen siendo colores de estado independientes.
- `rounded-full` y `rounded-none` solo se usan cuando la forma es intencionalmente circular/píldora o sin radio. Evitar valores arbitrarios como `rounded-[18px]` o `border-radius: 16px`.

Antes de una refactorización visual amplia, ejecutar `python3 temp/audit_ui_tokens.py --details` para localizar excepciones. El script solo analiza; las ediciones siguen haciéndose deliberadamente en código/CSS.

## Iconografía del sistema

- Tamaño único: **todos** los iconos miden `--icon-size` (1rem / 16px). No hay escala de iconos ni tamaños por contexto.
- El contrato vive en `resources/css/app.css`: la regla base `svg.lucide` aplica `--icon-size` a cualquier icono Lucide, incluso si no declara clase.
- Cuando haga falta declararlo en el marcado, usar `size-4`; no introducir `size-3`, `size-5`, `size-6`, `h-5 w-5` ni valores arbitrarios como `size-[18px]`.
- Los primitives que fijan tamaño de SVG (`button`, `alert`, `breadcrumb`, `empty`, `select`, `dropdown-menu`, `sidebar`, `toggle`, `navigation-menu`, `calendar`) usan `size-4`.
- Excepción del contrato: el icono dentro de `Badge` mide `calc(1rem * var(--badge-scale))`, porque el badge completo va escalado y un icono de 16px lo deformaría.
- Excepción del contrato: en móvil, los iconos de la barra inferior miden `1.2rem` y el de la acción flotante `1.5rem` sobre un botón de 56px, la medida estándar de un FAB. En ambos el icono es el objetivo táctil y a 16px queda por debajo de lo cómodo.
- Los estados vacíos y los placeholders de imagen también usan el tamaño estándar; el contenedor aporta la presencia visual, no el icono.
- Excepción única: el punto indicador de `DropdownMenuRadioItem` (`CircleIcon`) mantiene `size-2` porque es un indicador de selección, no iconografía.
- No son iconos y quedan fuera del contrato: el logo (`AppLogoIcon`, es un `<img>`), las ilustraciones decorativas (`MountainScene`) y el QR de doble factor.

## Tipografía del sistema

- La tipografía es **Inter Variable**, empaquetada con `@fontsource-variable/inter` e importada desde `resources/css/app.css`: se sirve desde el propio build, sin CDN ni dependencia de que esté instalada en el sistema.
- La pila de respaldo, definida en `resources/css/app.css`, sigue con `-apple-system` (San Francisco en iOS y macOS), `Segoe UI` (Windows), `Roboto` (Android) y `Helvetica`/`Arial`/`sans-serif`.
- El subconjunto latino se precarga desde `resources/views/app.blade.php` con `Vite::asset()`. Sin esa precarga el woff2 solo se descubre al analizar el CSS y la primera pintura sale con la fuente de respaldo.
- `font-sans` y `font-display` usan la misma pila para preservar consistencia entre plataformas.

## Skeletons de datos

- Boneyard se usa únicamente en componentes que tengan un estado de carga real (`loading`) o suspendan; nunca como overlay global de navegación ni para formularios de autenticación.
- Cada componente que espere datos remotos envuelve solo su propia superficie con `Skeleton` de `boneyard-js/react`, define un `name` estable y, si necesita datos para renderizar durante la captura, aporta un `fixture` sin datos reales.
- `resources/js/app.tsx` configura una sola vez los valores visuales globales y carga `resources/js/bones/registry.ts`; ningún componente importa JSON de bones manualmente.
- La captura automática de Boneyard solo se habilita cuando una superficie asíncrona nombrada tenga una ruta o fixture de desarrollo explícita. No añadir watchers globales: Laravel/Inertia sirve las páginas desde PHP y una captura global recorrería enlaces/formularios sin estado de datos que capturar.
- Los bones generados viven en `resources/js/bones/` y se versionan; el registro de entrada permite que cada `Skeleton` nombrado los resuelva automáticamente.
- Las rutas protegidas no almacenan cookies, tokens ni credenciales en `boneyard.config.json`. Para capturar una superficie autenticada se usa un fixture o un entorno local de desarrollo explícitamente preparado.

## UX crítica para Guaranda Go

- Estados offline visibles.
- Indicador de GPS/señal débil.
- Botones grandes para uso en exterior.
- Confirmaciones antes de cancelar recorrido o borrar descargas.
- Advertencias claras si una ruta tiene incidencias activas.
