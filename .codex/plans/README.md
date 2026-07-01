# Planes de desarrollo — Guaranda Go

Esta carpeta contiene planes `.md` por fase para guiar el desarrollo de la app híbrida Android.

## Estados permitidos

- `Pendiente`
- `En progreso`
- `Completado`
- `Bloqueado`
- `Requiere revisión`

## Regla de uso

Antes de implementar una fase, el agente debe:

1. Leer este índice.
2. Leer el plan específico de la fase.
3. Actualizar el campo `Estado` del plan cuando avance.
4. Registrar cambios relevantes en `.codex/progress/session_log.md`.
5. Actualizar `.codex/progress/current_status.md` si cambia la fase activa.

## Fases

| Fase | Plan | Estado |
|---|---|---|
| 00 | `00_base_actual.md` | Completado |
| 01 | `01_seeders_catalogos.md` | Completado |
| 02 | `02_auth_roles_usuarios.md` | Completado |
| 03 | `03_panel_admin_base.md` | Completado |
| 04 | `04_rutas_admin.md` | Completado |
| 05 | `05_mapa_visualizacion_rutas.md` | Completado |
| 06 | `06_pois.md` | Completado |
| 07 | `07_incidencias.md` | Completado |
| 08 | `08_recorridos_gps.md` | Completado |
| 09 | `09_offline_sincronizacion.md` | Completado |
| 10 | `10_valoraciones_favoritos.md` | Completado |
| 11 | `11_chatbot_n8n.md` | Completado |
| 12 | `12_capacitor_android.md` | Requiere revisión |
| 13 | `13_estadisticas_reportes.md` | Completado |
| 14 | `14_validacion_final.md` | Requiere revisión |
| 15 | `15_agente_n8n_tools.md` | En progreso |
| 16 | `16_refactor_frontend_mobile_design.md` | Completado |

## Fase activa sugerida

Implementación activa:

```txt
15_agente_n8n_tools.md
16_refactor_frontend_mobile_design.md
```

Validación manual final en Android real:

```txt
12_capacitor_android.md
14_validacion_final.md
```

El sistema web/backend ya tiene módulos funcionales implementados y validación local aprobada. Lo pendiente para cierre total es instalar el APK generado por GitHub Actions en un Android 13+ y verificar login, mapa, GPS, cámara, offline y notificaciones.
