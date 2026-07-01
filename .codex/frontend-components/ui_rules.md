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

## UX crítica para Guaranda Go

- Estados offline visibles.
- Indicador de GPS/señal débil.
- Botones grandes para uso en exterior.
- Confirmaciones antes de cancelar recorrido o borrar descargas.
- Advertencias claras si una ruta tiene incidencias activas.
