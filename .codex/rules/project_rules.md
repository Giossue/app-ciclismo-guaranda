# Reglas generales del proyecto

## Naturaleza del producto

- Guaranda Go es una app híbrida Android para cicloturismo.
- No es una PWA pura.
- El backend es Laravel en `ciclismo-guaranda/`.
- El frontend es React + Inertia + TypeScript + Vite.
- Android se empaqueta con Capacitor.
- El sistema requiere servidor para API, base de datos, n8n, mapas/rutas, archivos y sincronización.

## Prioridades técnicas

1. Funcionar bien en Android 13+.
2. Mobile first.
3. Offline real para rutas descargadas, mapas, POIs, recorridos e incidencias pendientes.
4. GPS confiable durante recorrido, incluyendo pantalla bloqueada si el plugin nativo lo permite.
5. Seguridad de datos personales y ubicación.
6. Backend modular y mantenible.

## Reglas de implementación

- No hardcodear credenciales, API keys, webhooks ni secretos.
- No agregar dependencias sin justificarlo y pedir aprobación.
- No cambiar decisiones de arquitectura sin actualizar `README.md` y `.codex`.
- No crear módulos de IA internos; solo consumir webhook externo de n8n.
- No crear usuarios invitados: todo requiere autenticación.
- No permitir creación pública de rutas por ciclistas.
- No prometer soporte prioritario para iOS.

## Reglas de base de datos y seeders

- Regla obligatoria: **no usar seeders para llenar datos de producción en cada deploy**.
- En Dokploy, `RUN_SEEDERS=false` o sin definir.
- Los seeders quedan solo como herramienta de desarrollo/testing o carga intencional, no como flujo normal.
- Para datos reales de la BD —catálogos, rutas, POIs, valores iniciales, contenido completo— se hace **directo en la BD de producción**.
- Para cambios de estructura —schema, tablas, columnas, índices, relaciones— se usan **migraciones Laravel**. Eso no se debe hacer directo a mano salvo emergencia justificada.
- Resumen operativo: `Schema/tablas/columnas → migraciones`; `Datos reales de producción → directo en BD`; `Datos de prueba/local → seeders/factories`; `Deploy normal → sin seeders`.
