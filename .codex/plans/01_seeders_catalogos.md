# Fase 01 — Seeders y catálogos iniciales

Estado: `Completado`

## Objetivo

Crear los datos base necesarios para que el sistema pueda operar: roles, géneros, estados, categorías y catálogos.

## Tareas

- Crear seeders para:
  - `roles_usuario`: ciclista, administrador.
  - `generos`: masculino, femenino.
  - `estados_ruta`: borrador, activa, inactiva.
  - `dificultades_ruta`: fácil, media, difícil.
  - `categorias_ruta`: familiar, MTB, urbana, montaña, turística.
  - `motores_enrutamiento`: OSRM, GraphHopper, OpenRouteService.
  - `medios_transporte`: bicicleta, caminata.
  - `categorias_poi`: comida, tienda, taller, salud, hospedaje, mirador.
  - `rangos_precio`: económico, moderado, alto.
  - `tipos_cocina`.
  - `tipos_hospedaje`.
  - `tipos_tienda`.
  - `especialidades_taller`.
  - `servicios_taller`.
  - `tipos_centro_salud`.
  - `estados_recorrido`: en curso, pausado, finalizado, cancelado.
  - `tipos_incidencia`: derrumbe, obstáculo, vía cerrada, inseguridad, accidente, daño en señalética.
  - `estados_incidencia`: reportada, en revisión, resuelta, descartada.
  - `estados_moderacion`: pendiente, aprobado, oculto, rechazado.
  - `formatos_exportacion`: GPX, GeoJSON.
- Crear usuario administrador inicial desde seeder si el usuario lo confirma o si ya está definido.
- Ejecutar seeders en BD remota.

## Criterios de finalización

- Seeders idempotentes usando `updateOrCreate` o equivalente.
- `composer test` pasa.
- Seeders aplicados en BD remota.
- Progreso actualizado.

## Validación sugerida

```bash
composer lint
composer test
php artisan db:seed --force
```

## Resultado

- Se creó `CatalogSeeder` con catálogos idempotentes mediante `updateOrCreate`.
- Se reemplazó el usuario de prueba del `DatabaseSeeder` por seeders reales de la app.
- Se creó `InitialAdminUserSeeder`, que solo crea/actualiza el administrador si existen `GUARANDA_GO_ADMIN_EMAIL` y `GUARANDA_GO_ADMIN_PASSWORD` en la configuración del entorno.
- Se agregó `config/guaranda.php` para centralizar configuración propia de Guaranda Go sin hardcodear credenciales.
- Se agregó `CatalogSeederTest` para validar catálogos e idempotencia.
- Se ejecutó `composer test` correctamente.
- Se ejecutó `db:seed --force` contra PostgreSQL remoto y se verificaron conteos de los 20 catálogos.
