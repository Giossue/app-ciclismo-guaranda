# Operaciones de base de datos

## Base objetivo

La base de datos objetivo del proyecto es PostgreSQL + PostGIS remota para Guaranda Go.

Datos no sensibles que pueden documentarse:

```txt
Host: 187.127.6.234
Puerto: 8004
Base de datos: guaranda_go_db
Usuario: guaranda_go_app
```

## Credenciales

- No guardar contraseñas en el repositorio.
- No escribir contraseñas en migraciones, seeders, documentación, comandos visibles, frontend ni APK.
- Configurar la contraseña fuera del repo mediante variable de entorno local, `.pgpass` del sistema o secreto del entorno de despliegue.
- Para `psql`, usar preferentemente `PGPASSWORD` o `.pgpass` configurado fuera del repositorio.

## Regla obligatoria: producción sin seeders automáticos

- **No usar seeders para llenar datos de producción en cada deploy**.
- En Dokploy, `RUN_SEEDERS=false` o sin definir.
- Los seeders quedan solo como herramienta de desarrollo/testing o carga intencional, no como flujo normal.
- Para datos reales de la BD —catálogos, rutas, POIs, valores iniciales, contenido completo— se hace **directo en la BD de producción**.
- Para cambios de estructura —schema, tablas, columnas, índices, relaciones— se usan **migraciones Laravel**. Eso no se debe hacer directo a mano salvo emergencia justificada.

Resumen operativo:

```txt
Schema/tablas/columnas → migraciones
Datos reales de producción → directo en BD
Datos de prueba/local → seeders/factories
Deploy normal → sin seeders
```

## Regla operativa para agentes

El usuario autorizó que, a partir de ahora, si una fase o tarea necesita cambios de base de datos, el agente debe implementarlos y aplicarlos sin pedir una confirmación adicional, respetando la separación entre estructura y datos reales.

Cuando la tarea actual implique cambios de BD, el agente debe:

1. Para cambios de estructura, crear/aplicar migraciones Laravel.
2. Para datos reales de producción, aplicar cambios directamente en la BD remota usando SQL/cliente BD configurado, sin convertirlo en seeder de deploy.
3. Para datos de prueba/local, usar seeders/factories solo en entorno de desarrollo o testing.
4. Evitar cambios destructivos directos. Para operaciones destructivas, preferir migraciones reversibles o SQL explícito con explicación del impacto.
5. Registrar el avance en `.codex/progress/current_status.md` y `.codex/progress/session_log.md` cuando la operación forme parte de una fase o cambie el estado del sistema.

Si una fase no requiere cambios de esquema o datos, no se debe ejecutar una operación de BD innecesaria.

## Comando base esperado

```bash
psql -w -h 187.127.6.234 -p 8004 -U guaranda_go_app -d guaranda_go_db
```

El comando asume que la contraseña ya está disponible fuera del repositorio.
