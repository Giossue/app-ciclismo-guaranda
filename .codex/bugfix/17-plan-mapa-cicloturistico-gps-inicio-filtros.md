# 17 — Plan: mapa cicloturístico, filtros, GPS y restricción de inicio

## Estado

Pendiente de aprobación.

## Feedback recibido

- Si el usuario no está en el punto de inicio de la ruta, no podrá iniciar el recorrido.
- En el mapa debe salir aviso: debe acercarse al punto de partida.
- Actualmente se traza una línea recta hasta el punto de inicio; eso debe quitarse.
- Solo debe marcar el punto de inicio y la ubicación actual.
- El mapa cicloturístico debe mostrar todos los puntos: rutas, POIs, incidencias, etc., sin exigir obtener primero la ubicación.
- En el mapa cicloturístico sale un trazo que se debe quitar; dejar puntos y añadir badges para filtrar.
- Agregar modo satélite y mejorar contraste del trazado cuando se use trazado.

## Relación con planes existentes

- Complementa `.codex/bugfix/11-plan-trazado-rutas-enrutamiento.md`.
- Complementa `.codex/bugfix/12-plan-organizacion-rutas-pois-offline.md`.
- Complementa `.codex/bugfix/13-plan-contraste-tema-botones.md`.
- Complementa `.codex/bugfix/14-plan-admin-rutas-editor-avanzado.md`.

## Observación técnica actual

- `RouteMap` actualmente muestra:
  - GeoJSON de rutas,
  - inicio/final,
  - POIs vinculados,
  - incidencias,
  - ubicación actual si el usuario la solicita,
  - línea recta desde ubicación actual al inicio.
- `routes/index.tsx` usa `RouteMap routes={routes.data}` para el mapa cicloturístico, por eso también muestra trazados.
- La información ya se carga sin ubicación; el problema es la presentación y los filtros.
- `TrackPanel` permite iniciar recorrido sin validar cercanía geográfica al punto inicial.

## Plan propuesto

### 1. Quitar línea recta hacia inicio

- Eliminar el `Polyline` de conexión GPS → inicio en `RouteMap`.
- Mantener marcador de ubicación actual.
- Mantener marcador de inicio.
- Si se conserva botón `Ir al inicio`, debe abrir mapa externo o mostrar solo instrucción, no dibujar ruta interna falsa.

### 2. Separar modos del mapa

Crear props/modos para `RouteMap`:

- `overview` para mapa cicloturístico/listado:
  - mostrar puntos y badges de filtro,
  - ocultar trazados por defecto,
  - permitir activar trazados si se desea.
- `route-detail` para detalle de una ruta:
  - mostrar trazado oficial,
  - inicio/final,
  - POIs de esa ruta,
  - incidencias.
- `admin-editor` separado ya existe como `RouteGeometryEditor`.

### 3. Badges/filtros del mapa cicloturístico

Agregar filtros visibles tipo badges/chips:

- Rutas.
- Inicios/finales.
- POIs.
- Incidencias.
- Favoritas si aplica.
- Trazados: desactivado por defecto en mapa general.

Reglas:

- El usuario debe ver puntos sin pedir GPS.
- GPS solo agrega “mi ubicación”.
- Los filtros no deben depender de permisos de ubicación.

### 4. Restricción para iniciar recorrido

- Antes de iniciar recorrido, validar distancia entre ubicación actual y punto inicial.
- Umbral sugerido inicial: 100–150 metros; confirmar con usuario/equipo.
- UX:
  - botón `Iniciar recorrido` pide ubicación si no existe,
  - si está lejos, mostrar Alert: “Debes acercarte al punto de partida para iniciar”.
  - mostrar distancia aproximada al inicio.
  - no crear recorrido backend si está fuera de rango.
- Validación de seguridad:
  - frontend mejora UX,
  - backend debería validar si se envían coordenadas al iniciar para evitar saltarse la restricción.
- Si no hay permiso GPS, no permitir iniciar y explicar que se necesita ubicación.

### 5. Modo satélite

- Agregar selector de capa mapa/satélite en `RouteMap`.
- Verificar proveedor/licencia/costo antes de implementar.
- Sin claves en frontend/APK.

### 6. Contraste en mapa

- Para trazados oficiales en detalle, usar línea con halo o color de alto contraste.
- Para mapa general, ocultar trazados por defecto para evitar saturación visual.
- Mantener símbolos diferenciados para POIs, incidencias, inicio y final.

## Archivos que se tocarían después de aprobar

- `resources/js/components/routes/route-map.tsx`.
- `resources/js/pages/routes/index.tsx`.
- `resources/js/pages/routes/show.tsx`.
- `app/Http/Controllers/Cyclist/TrackController.php`.
- Request de inicio de recorrido si existe o se crea.
- Tests de ciclo de recorrido GPS.

## Datos/BD

- Puede no requerir migración si al iniciar se envían coordenadas solo para validación inmediata.
- Si se decide guardar coordenada inicial declarada, revisar esquema actual de recorridos/puntos GPS antes de migrar.

## Criterios de aceptación

- El mapa general muestra puntos sin solicitar ubicación.
- El mapa general no muestra trazos por defecto.
- El usuario puede filtrar puntos con badges.
- Al pedir ubicación, solo aparece “mi ubicación”; no aparece línea recta al inicio.
- Si el usuario está lejos del inicio, no puede iniciar recorrido y ve mensaje claro.
- Si está dentro del rango permitido, puede iniciar.
- El detalle de ruta mantiene trazado oficial legible.
- Modo satélite disponible si hay proveedor válido.

## Validación mínima cuando se implemente

- Tests focalizados de `TrackController` / ciclo GPS.
- Tests de mapa/rutas si aplican.
- `vendor/bin/pint --dirty --format agent` si se toca PHP.
- `php artisan test --compact --filter=Track`.
- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Prueba manual Android/WebView: GPS denegado, lejos del inicio, cerca del inicio, mapa general con filtros.

## Avance implementado

- Eliminada línea recta desde ubicación actual al inicio.
- Mapa cicloturístico usa modo overview: puntos/filtros y trazados ocultos por defecto.
- Agregados filtros por inicios/finales, POIs, incidencias y trazados.
- Agregado toggle de capa mapa/satélite.
- Inicio de recorrido exige ubicación y valida cercanía al punto de partida en frontend y backend.
