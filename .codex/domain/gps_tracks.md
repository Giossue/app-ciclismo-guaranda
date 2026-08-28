# Dominio: GPS y recorridos

## Estados

- En curso.
- Pausado.
- Finalizado.
- Cancelado.

## Reglas

- El usuario debe presionar `Iniciar recorrido`.
- Se solicita consentimiento de ubicación.
- Se registra un punto GPS cada 60 segundos.
- Se prioriza precisión sobre ahorro de batería.
- Debe soportar pantalla bloqueada en Android mediante capacidades nativas si se implementa.
- La distancia recorrida se calcula principalmente como avance sobre ruta oficial.

## Métricas

- Distancia recorrida.
- Distancia restante.
- Tiempo transcurrido.
- Tiempo estimado restante.
- Velocidad actual.
- Velocidad promedio.
- Elevación.
- Desnivel acumulado.
- Porcentaje de avance.

## Recorrido válido

Un recorrido es válido cuando completa aproximadamente 90% de la ruta oficial.

## Visibilidad admin

El administrador puede ver métricas agregadas y recorridos completos con puntos GPS.

## Retención

Los puntos GPS se conservan mientras exista el recorrido. No hay política avanzada de purga automática en esta versión.
