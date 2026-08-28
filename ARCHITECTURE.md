# Mapa de arquitectura — Guaranda Go

## Sistema real

Guaranda Go es un monolito Laravel 13 con interfaz React 19/Inertia 3 y TypeScript. La misma aplicación sirve la experiencia web y, mediante Capacitor, se ejecuta como una app híbrida Android 13+.

```text
APK Capacitor Android
  └─ WebView: React + Inertia + Tailwind + shadcn/ui
       ├─ plugins nativos: GPS, cámara, SQLite, archivos, red y notificaciones
       └─ Laravel 13
            ├─ vistas Inertia y API REST de sincronización
            ├─ Fortify, policies y middleware
            ├─ PostgreSQL + PostGIS
            ├─ Redis + jobs
            ├─ almacenamiento de medios
            └─ servicios de IA OpenAI y geográficos
```

## Límites y dirección de dependencias

- Las páginas React usan rutas Wayfinder y contratos enviados por Laravel; no conocen secretos ni llaman directamente a OpenAI, OpenTopoData ni servicios con credenciales.
- Controllers y endpoints validan entradas, delegan reglas que crecen a Actions/Services y devuelven respuestas consistentes. Las Policies autorizan cada registro en el servidor.
- Eloquent y las migraciones Laravel son la frontera de persistencia. PostgreSQL/PostGIS es producción; SQLite se usa para pruebas y el almacenamiento local Android es una réplica/offline distinta.
- Integraciones externas viven detrás de servicios Laravel. Los jobs procesan tareas lentas o reintentables.
- Capacitor encapsula capacidades Android; el frontend debe conservar un fallback web razonable cuando la capacidad nativa no esté disponible.

## Módulos implementados

- Identidad, perfiles, roles, 2FA/passkeys y administración de usuarios.
- Rutas, geometrías PostGIS, métricas, imágenes, mapa Leaflet y POIs.
- Incidencias, recorridos GPS, favoritos, valoraciones, notificaciones y estadísticas.
- Paquetes offline, cola de sincronización y adaptadores nativos Android.
- Chat seguro: Laravel construye contexto público vivo, consulta OpenAI desde servidor y conserva el historial propio sin enviar secretos ni ubicación persistente.

## Lectura detallada

- Índice técnico: [docs/architecture/index.md](docs/architecture/index.md)
- Producto y vocabulario: [docs/product/overview.md](docs/product/overview.md)
- Especificación completa: [README.md](README.md)
- Contexto operativo y planes: [.codex/README.md](.codex/README.md)
