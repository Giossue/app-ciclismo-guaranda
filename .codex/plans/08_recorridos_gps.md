# Fase 08 — Recorridos GPS

Estado: `Completado`

## Objetivo

Registrar recorridos del ciclista y calcular métricas.

## Tareas

- Iniciar recorrido.
- Pausar/reanudar.
- Finalizar/cancelar.
- Guardar puntos cada 60 segundos.
- Calcular métricas.
- Determinar recorrido válido al 90%.
- Mostrar resumen final.
- Permitir exportar recorrido.

## Criterios de finalización

- Recorrido se guarda correctamente.
- Puntos GPS se registran.
- Métricas se calculan.
- Solo recorrido válido habilita valoración.
- Prueba real en Android planificada o ejecutada.


## Resultado

- Ciclistas pueden iniciar recorridos sobre rutas activas.
- Se agregó panel de recorrido en el detalle de ruta con estado, puntos, distancia, avance y validez.
- Mientras el recorrido está `en curso`, la UI intenta registrar un punto GPS cada 60 segundos usando Geolocation con alta precisión.
- Se implementó registro manual de punto GPS, pausa, reanudación, finalización y cancelación.
- Se calculan distancia recorrida, distancia restante, avance, velocidad promedio, velocidad actual, desnivel positivo, tiempo y estimado restante.
- Un recorrido queda válido para valoración cuando alcanza al menos el 90% de la distancia oficial de la ruta.
- Se agregó resumen final del recorrido y exportación GPX/GeoJSON.
- La prueba real en Android queda planificada para la Fase 12 (`12_capacitor_android.md`) porque requiere APK/dispositivo real y permisos nativos.
- No se requirió migración ni operación de BD remota: el esquema existente ya cubría recorridos, estados y puntos GPS.

## Validación ejecutada

```bash
php ciclismo-guaranda/artisan wayfinder:generate --with-form --no-interaction
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='CyclistTrackLifecycleTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```
