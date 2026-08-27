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
- Primitives shadcn y controles compartidos deben usar el token semántico adecuado (`control` para inputs/badges/toggles; `surface` para botones, cards, diálogos y toasts).
- Alturas: `--control-height`, `--action-height`, `--action-height-sm` y `--action-height-lg`.
- Elevaciones: `--elevation-flat`, `--elevation-subtle`, `--elevation-raised` y `--elevation-floating`.
- `rounded-full` y `rounded-none` solo se usan cuando la forma es intencionalmente circular/píldora o sin radio. Evitar valores arbitrarios como `rounded-[18px]` o `border-radius: 16px`.

Antes de una refactorización visual amplia, ejecutar `python3 temp/audit_ui_tokens.py --details` para localizar excepciones. El script solo analiza; las ediciones siguen haciéndose deliberadamente en código/CSS.

## Tipografía del sistema

- La interfaz no descarga fuentes web ni depende de que una fuente esté instalada manualmente.
- La pila global, definida en `resources/css/app.css`, prioriza `-apple-system` (San Francisco en iOS y macOS), seguida de `Segoe UI` (Windows), `Roboto` (Android) y `Helvetica`/`Arial`/`sans-serif` como respaldo.
- `font-sans` y `font-display` usan la misma pila nativa para preservar rendimiento, legibilidad y consistencia por plataforma.

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
