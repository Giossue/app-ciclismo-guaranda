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
- Todo `Sheet` se abre y se cierra por la derecha. No usar `side` ni sobrescribir sus clases de transición; para una interacción que deba subir desde abajo se evalúa `Drawer` explícitamente.
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
- `Badge` tiene tres variantes: `default` (sólido de marca) para el estado vigente, `outline` (neutro) para metadatos y estados apagados, y `destructive` (rojo) exclusivamente para avisos pendientes o no leídos. El significado siempre se mantiene también en el texto o etiqueta accesible, nunca solo por color.
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

- La tipografía principal es **Arial**, definida en `resources/css/app.css`; no se carga una fuente externa, desde CDN ni desde el bundle.
- La pila de respaldo es `Helvetica` y `sans-serif`, para que cada plataforma mantenga una alternativa legible cuando Arial no esté disponible.
- `font-sans` y `font-display` usan la misma pila para preservar consistencia entre plataformas.

### Pesos

- **Arial solo tiene dos pesos reales: 400 y 700.** Los intermedios de CSS no existen en la fuente y el navegador los resuelve en silencio (500 → 400, 600 → 700); un `900` puede además saltar a Arial Black donde esté instalada y cambiar el render entre Android y escritorio.
- Por eso `@theme` fija **todos** los alias de `--font-weight-*` a 400 o 700. `font-medium` es 400 y `font-semibold`, `font-bold`, `font-black` son 700. Escribir cuatro clases distintas no produce cuatro pesos: produce dos.
- El sistema tiene entonces **dos escalones**: 400 para cuerpo, metadatos y texto apagado; 700 para títulos y énfasis puntual. No añadir pesos ni declarar `font-weight` numérico en CSS por pantalla.
- Como la escalera de pesos es corta, **la jerarquía se construye con tamaño y color**, no con negritas. Un título y su descripción pueden compartir tamaño y separarse solo con `text-muted-foreground`; ese es el recurso por defecto antes de subir a 700.
- Nunca poner texto apagado en 700: `text-muted-foreground` con negrita se lee como error, no como jerarquía.

### Ritmo de espaciado

- El `gap` baja un escalón por cada nivel de anidamiento, de forma que el agrupamiento se lea sin bordes ni fondos: `gap-6` entre secciones de página → `gap-4` dentro de una card → `gap-3` entre ítems de una lista o rejilla → `gap-2` en línea (icono + texto, botones contiguos) → `gap-1`/`gap-1.5` dentro de un átomo (etiqueta + valor).
- La densidad de una card sale del token local `--card-spacing`, del que se calculan relleno vertical, relleno horizontal y separación interna. Para comprimir o airear una card se cambia ese número o se usa `size="sm"`; no se sobrescriben `px-*`/`py-*`/`gap-*` por pantalla.
- Las tablas van **al revés que los controles**: celdas con `px-4 py-4` y encabezados con `h-auto`. El ojo escanea una tabla en vertical y necesita separación entre filas, aunque el resto de la interfaz sea compacta.
- Los encabezados de tabla van en `font-normal`; se distinguen por posición y borde, no por negrita.
- Para rejillas de tarjetas usar `CardGrid`, que arranca en dos columnas en móvil y resuelve los huérfanos (último elemento solo en su fila y conjuntos con menos elementos que columnas). No rehacer esa lógica con `grid-cols-*` sueltos.

### Densidad y objetivo táctil

- Las alturas de control de Guaranda Go (`--control-height` 52px, `--action-height` 44px, `min-h-11` en `Button`) responden a uso táctil en exterior y **no se comparan con las de un panel de escritorio**. No bajarlas para ganar densidad: 44px es el mínimo de objetivo táctil y las propias reglas de UX piden botones grandes.
- La compacidad se gana en tipografía, iconografía y espaciado, nunca en el tamaño del objetivo táctil.

## UX crítica para Guaranda Go

- Estados offline visibles.
- Indicador de GPS/señal débil.
- Botones grandes para uso en exterior.
- Confirmaciones antes de cancelar recorrido o borrar descargas.
- Advertencias claras si una ruta tiene incidencias activas.
