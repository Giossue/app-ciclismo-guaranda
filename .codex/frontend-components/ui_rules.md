# Reglas UI — shadcn/ui + Tailwind v4

## Principios

- Mobile first siempre.
- Reutilizar componentes existentes antes de crear nuevos.
- Usar shadcn/ui como base visual.
- Mantener accesibilidad: labels, alt text, focus states, títulos en diálogos/sheets.

## Reglas shadcn

- Usar `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` completos cuando aplique.
- Usar `Badge` para estados: activa, inactiva, borrador, reportada, resuelta, offline.
- Usar `Alert` para advertencias de GPS, offline, incidencias y permisos.
- Usar `Skeleton` para carga.
- Usar `Empty` para estados vacíos.
- Usar `Dialog`, `Sheet` o `Drawer` con título accesible.
- Usar `FieldGroup` y `Field` para formularios.
- Usar `sonner` para toasts si ya está disponible.

## Tailwind

- Evitar `space-x-*` y `space-y-*`; usar `gap-*`.
- Usar colores semánticos: `bg-background`, `text-muted-foreground`, `bg-primary`.
- Evitar colores hardcodeados salvo necesidad justificada.
- Usar `size-*` cuando ancho y alto sean iguales.
- Usar `cn()` para clases condicionales.

## Tokens visuales globales

Los estilos reutilizables se definen en `resources/css/app.css`; no crear otra fuente de verdad para radios, alturas o elevaciones.

- Radios: `--radius-tight`, `--radius-compact`, `--radius-control`, `--radius-surface`, `--radius-emphasis`, `--radius-map`, `--radius-pill` y `--radius-circle`.
- Las utilidades `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` y `rounded-3xl` se enlazan a esa escala desde `@theme`.
- Primitives shadcn y controles compartidos deben usar el token semántico adecuado (`control` para inputs/badges/toggles; `surface` para botones, cards, diálogos y toasts).
- Alturas: `--control-height`, `--action-height`, `--action-height-sm` y `--action-height-lg`.
- Elevaciones: `--elevation-flat`, `--elevation-subtle`, `--elevation-raised` y `--elevation-floating`.
- `rounded-full` y `rounded-none` solo se usan cuando la forma es intencionalmente circular/píldora o sin radio. Evitar valores arbitrarios como `rounded-[18px]` o `border-radius: 16px`.

Antes de una refactorización visual amplia, ejecutar `python3 temp/audit_ui_tokens.py --details` para localizar excepciones. El script solo analiza; las ediciones siguen haciéndose deliberadamente en código/CSS.

## Tipografía del sistema

- La interfaz no descarga fuentes web ni depende de que una fuente esté instalada manualmente.
- La pila global, definida en `resources/css/app.css`, prioriza `-apple-system` (San Francisco en iOS y macOS), seguida de `Segoe UI` (Windows), `Roboto` (Android) y `Helvetica`/`Arial`/`sans-serif` como respaldo.
- `font-sans` y `font-display` usan la misma pila nativa para preservar rendimiento, legibilidad y consistencia por plataforma.

## UX crítica para Guaranda Go

- Estados offline visibles.
- Indicador de GPS/señal débil.
- Botones grandes para uso en exterior.
- Confirmaciones antes de cancelar recorrido o borrar descargas.
- Advertencias claras si una ruta tiene incidencias activas.
