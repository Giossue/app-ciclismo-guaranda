# Frontend React + Inertia

## Ubicación

`ciclismo-guaranda/resources/js/`

Estructura actual relevante:

```txt
resources/js/
├── actions/      # Wayfinder
├── components/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/       # Wayfinder
├── types/
└── app.tsx
```

## Reglas

- Mobile first.
- TypeScript estricto.
- Usar componentes existentes antes de crear nuevos.
- Usar shadcn/ui para UI base.
- Usar Wayfinder para rutas tipadas cuando corresponda.
- Evitar lógica de negocio pesada en componentes.
- Separar hooks para comportamiento reutilizable: GPS, network, offline, sync.

## Pantallas principales

- Login/registro.
- Inicio.
- Lista de rutas.
- Mapa.
- Detalle de ruta.
- Descargas offline.
- Recorrido activo.
- Favoritos.
- Perfil.
- Reportar incidencia.
- Chatbot externo n8n.
- Historial/resumen de recorridos.

## Estado y datos

Si se agrega librería de estado o data fetching, justificar antes. Preferir primero patrones existentes del starter. Para offline, aislar acceso a SQLite/filesystem en servicios/hook específicos.
