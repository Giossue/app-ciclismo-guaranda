# Formularios y workflows

## Formulario

- Un `Field` tiene label, control, ayuda solo si aporta decisión y error junto al campo.
- Validación cliente mejora la experiencia; Laravel es la autoridad y debe devolver errores de validación consistentes.
- Al enviar, prevenir doble submit, mostrar pendiente y conservar/corregir valores según resultado.
- Archivos muestran tipo, límite, estado de carga y resultado. El servidor vuelve a validar MIME/tamaño/contenido.

## Confirmación

| Riesgo | Patrón |
| --- | --- |
| Reversible (pausar, desactivar, quitar favorito) | Un paso con feedback y, si procede, opción de revertir. |
| Impacto significativo (cancelar recorrido, eliminar descarga) | Diálogo que explica consecuencia y confirma explícitamente. |
| Irreversible o masivo | Confirmación reforzada con nombre/referencia y autorización de servidor. |

## Relaciones y flujos largos

Usa selector buscable, mapa o lista estructurada para relaciones; no un textarea de IDs. Divide editor de rutas, recorrido u offline en secciones/tabs locales sin alterar URL cuando el botón atrás Android deba conservar su significado.
