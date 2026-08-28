# Arquitectura general del sistema

Guaranda Go es una app híbrida Android con backend Laravel y frontend React/Inertia empaquetado con Capacitor.

```mermaid
flowchart TD
    A[APK Android Capacitor] --> B[React + Inertia + TypeScript]
    B --> C[Plugins nativos Android]
    B --> D[Laravel API REST]
    C --> C1[GPS]
    C --> C2[Cámara]
    C --> C3[SQLite local]
    C --> C4[Filesystem]
    C --> C5[Notificaciones]
    D --> E[PostgreSQL + PostGIS]
    D --> F[Redis / Jobs]
    D --> G[Storage archivos]
    D --> H[n8n Webhook]
    D --> I[Mapas / Rutas]
```

## Principios

- Un solo proyecto Laravel en `ciclismo-guaranda/`.
- Backend modular por dominios.
- API REST para funciones móviles y sincronización.
- Inertia para vistas internas/web cuando aplique.
- Capacitor para empaquetar Android y acceder a APIs nativas.
- SQLite local para offline.
- PostGIS para geodatos.

## Módulos principales

- Usuarios y autenticación.
- Rutas.
- POIs.
- Incidencias.
- Recorridos GPS.
- Favoritos.
- Valoraciones/comentarios.
- Offline/sincronización.
- Chatbot n8n.
- Administración/estadísticas.
