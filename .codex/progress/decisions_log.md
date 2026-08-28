# Registro de decisiones

## 2026-08-27 — Información técnica administrativa

- El estado técnico de Guaranda Go se publica únicamente en `/settings`, protegido por `auth`, `verified`, rol administrador y la Policy de usuarios; `/admin/settings` queda como redirección compatible bajo la misma protección.
- La pantalla presenta todos los grupos de estado consecutivamente en una sola vista, sin tabs ni navegación secundaria. Expone estados y nombres de drivers, nunca secretos, credenciales ni URLs privadas de integraciones.

## 2026-08-27 — Fechas consistentes entre web y Android

- Las fechas de formularios usan un DatePicker propio basado en `Calendar` y `Popover` de shadcn, no `input[type="date"]` ni el selector nativo.
- La presentación se localiza en español y la frontera con Laravel conserva fechas ISO (`YYYY-MM-DD`) sin conversiones de zona horaria.

## 2026-06-29

- Guaranda Go será app híbrida Android con Capacitor.
- Distribución inicial: APK.
- Backend: Laravel 13 con monolito modular + API REST.
- Frontend: React + Inertia + TypeScript + Vite.
- Base objetivo: PostgreSQL + PostGIS.
- Offline: SQLite local + filesystem + cola de sincronización.
- IA: agente externo en n8n; el sistema solo consume webhook y muestra/procesa JSON de `Respond to Webhook`.
- Incidencias: visibles para ciclistas solo después de revisión administrativa.
- Mapa offline: objetivo de mapa de Ecuador completo + rutas/datos.
- No se guardan secretos ni contraseñas en el repositorio.
- Se usará la tabla `usuarios` del starter Laravel para autenticación, extendida con campos de perfil. No se creará una tabla separada `usuario`.
- El esquema de tablas del sistema debe estar en español.
- `spatial_ref_sys` queda como excepción técnica: es tabla interna de PostGIS y no debe renombrarse.
- Algunas columnas internas requeridas por Laravel/paquetes se mantienen con nombres esperados por el framework para no romper cache, colas, sesiones, passkeys y auth.
- Los catálogos iniciales se siembran con seeders idempotentes mediante `updateOrCreate`.
- El usuario administrador inicial no se hardcodea; solo se crea si el entorno define explícitamente `GUARANDA_GO_ADMIN_EMAIL` y `GUARANDA_GO_ADMIN_PASSWORD`.
- El registro público siempre asigna rol `ciclista`; los cambios de rol quedan reservados al administrador.
- La eliminación de cuenta se implementa como deshabilitación (`active=false`) más soft delete para preservar trazabilidad.
- Los usuarios inactivos no pueden iniciar sesión y, si conservan una sesión activa, son desconectados por middleware.
- En fase 02 se trabajó solo con tests/SQLite local y build local; no se aplicaron cambios de datos o esquema a BD remota.
- El panel administrador base se implementa como layout y navegación funcional con módulos placeholder protegidos; el CRUD específico de cada módulo queda para su fase correspondiente.
- En fase 03 no se aplicaron migraciones, seeders ni cambios sobre BD remota.
- En fase 04, el dibujo de rutas en mapa se difiere a Fase 05; mientras tanto el administrador ingresa GeoJSON `LineString` manualmente en el formulario.
- En fase 04, inactivar una ruta cambia su estado a `inactiva` e incrementa versión; no se realiza borrado físico para preservar trazabilidad.
- En fase 04, la columna `geom` PostGIS solo se actualiza cuando el driver es `pgsql` y la columna existe, manteniendo compatibilidad con SQLite en tests locales.
- En fase 04 no se ejecutaron migraciones, seeders ni cambios sobre BD remota.
- El usuario autorizó aplicar migraciones/seeders/cambios de datos en la BD remota cuando una fase lo requiera, sin pedir confirmación adicional.
- En fase 05 se integra Leaflet como biblioteca inicial de mapas para navegador/WebView Android.
- En fase 05, las incidencias mostradas sobre rutas son las asociadas a la ruta con estado `en revisión`, interpretadas como incidencias activas ya visibles para consulta del ciclista.
- En fase 05 no hizo falta migración nueva: geometría, POIs, pivote ruta-POI e incidencias ya existían en el esquema.
- En fase 06, los POIs oficiales se gestionan desde `/admin/pois`; desactivar un POI usa `active=false` + soft delete para ocultarlo del ciclista y preservar trazabilidad.
- En fase 06, las sugerencias y reportes de POIs creados por ciclistas quedan con estado `pendiente` para revisión administrativa posterior.
- En fase 06 no hizo falta migración nueva: categorías, tablas detalle, horarios, imágenes, pivote ruta-POI, sugerencias y reportes ya existían en el esquema.
- En fase 07, una incidencia nueva queda como `reportada` y no se muestra públicamente hasta revisión administrativa.
- En fase 07, el estado `en revisión` representa una incidencia activa validada visible para ciclistas en rutas/mapa.
- En fase 07, la foto de incidencia se guarda en disco `public` bajo `incidents/` y se limita a 5 MB; no se permiten videos.
- En fase 07 no hizo falta migración nueva: incidencias, archivos y notificaciones ya existían en el esquema.
- En fase 08, el cálculo inicial de avance usa distancia GPS acumulada contra la distancia oficial más reciente de `metricas_ruta`.
- En fase 08, un recorrido se marca válido (`is_valid=true`) cuando `completion_percentage >= 90`, preparando la habilitación de valoraciones en fase posterior.
- En fase 08, la captura cada 60 segundos se implementa en UI con Geolocation web/WebView; seguimiento con pantalla bloqueada queda para validación nativa en Fase 12/Capacitor.
- En fase 08 no hizo falta migración nueva: `recorridos`, `puntos_gps_recorrido` y `estados_recorrido` ya existían en el esquema.

- En fase 09 se implementa la persistencia offline local con IndexedDB para navegador/WebView, sin agregar dependencias nuevas; SQLite nativo se decidirá e integrará en Fase 12/Capacitor.
- En fase 09 el mapa offline de Ecuador queda como placeholder explícito dentro del paquete offline; el empaquetado cartográfico definitivo se implementará con Android/Capacitor.
- En fase 09 no hizo falta migración nueva: `descargas_ruta` y `entradas_cola_sincronizacion` ya existían en el esquema.
- En fase 10, una valoración nueva o editada vuelve siempre a estado `pendiente` para mantener moderación previa a visibilidad pública.
- En fase 10, el promedio público de ruta usa exclusivamente valoraciones con estado `aprobado`; `pendiente`, `oculto` y `rechazado` no cuentan.
- En fase 10 no hizo falta migración nueva: `rutas_favoritas_usuario`, `valoraciones_ruta` y `estados_moderacion` ya existían en el esquema.

## 2026-06-30

- En fase 11 se usa proxy backend Laravel para n8n; el frontend/APK solo recibe `webhookConfigured` y nunca la URL del webhook.
- El contrato recomendado para `Respond to Webhook` de n8n es JSON con `reply`; por compatibilidad se aceptan también `answer`, `message`, `text`, `response` y `output`.
- El contexto enviado a n8n se minimiza: edad/rol, ruta activa opcional y mensajes recientes; no se envía email ni nombre del usuario.
- El chatbot no se cola offline: si no hay conexión, la UI bloquea el envío y muestra aviso porque el agente externo solo funciona online.
- En fase 11 no hizo falta migración nueva: `conversaciones_ia` y `mensajes_ia` ya existían en el esquema.

- En fase 12, Guaranda Go se configura como shell Capacitor Android que carga Laravel/Inertia desde URL HTTPS configurada en GUARANDA_GO_MOBILE_SERVER_URL; no se hardcodea la URL en el repo ni en el frontend.
- En fase 12, se usa capacitor-www como fallback estático mínimo porque el monolito Laravel/Inertia no produce un index.html estático empaquetable por Capacitor.
- En fase 12, Android mínimo se fija en SDK 33 por el objetivo del producto Android 13+.
- En fase 12, SQLite nativo se prepara con @capacitor-community/sqlite; la migración completa de IndexedDB a SQLite queda condicionada a prueba real en dispositivo.
- En fase 12, la compilación APK queda bloqueada por entorno: falta Android SDK/ADB y debe usarse JDK 17 o compatible, no Java 26.

- En fase 12, la generación de APK se resuelve con GitHub Actions para evitar instalar Android Studio localmente.
- El APK debug se compila contra la URL móvil https://ciclismo.devs-ueb.tech mediante GitHub Secret GUARANDA_GO_MOBILE_SERVER_URL, sin hardcodear la URL en el repositorio.
- Capacitor Android 8 requiere Java 21 en CI para compilar correctamente.
- Fase 12 no se marca como Completado hasta validar instalación, login, mapa, GPS, cámara, offline y notificaciones en Android 13+.

- Para Dokploy se usará Dockerfile propio con PHP 8.4-FPM, Nginx, Supervisor, Node 22 y SSR de Inertia activo; secretos quedan solo en variables de entorno Dokploy.
- En Dokploy/Laravel se confían cabeceras X-Forwarded-* del proxy para generar URLs HTTPS correctas detrás del reverse proxy.
- La ruta /dashboard queda como redirección por rol: administradores a /admin/dashboard y ciclistas a /routes; se elimina el dashboard vacío del starter.
- En móvil, la navegación principal se mueve a bottom navbar de 4 opciones: 3 accesos rápidos por rol y Más para módulos/cuenta; el sidebar queda solo para desktop.

- Los módulos administrativos no deben quedar como páginas placeholder: catálogos, estadísticas y configuración se implementan como pantallas funcionales.
- Los catálogos del sistema se pueden administrar desde UI, pero los catálogos marcados como base se conservan identificados visualmente para evitar cambios accidentales de significado operativo.
- Las estadísticas iniciales se entregan con exportación CSV, no Excel/PDF, para cumplir el criterio funcional sin agregar dependencias nuevas.
- Las consultas de ruta se registran al abrir el detalle de una ruta activa para alimentar rankings de uso.
- En Dokploy, los seeders quedan desactivados por defecto; `RUN_SEEDERS=true` se usará solo para resembra intencional.
- Fase 14 no se marca como completada hasta validar APK en Android real; la validación local del código sí queda aprobada.

- Regla definitiva de BD: no usar seeders para llenar producción en cada deploy; datos reales van directo en BD de producción, estructura por migraciones, datos local/testing por seeders/factories y deploy normal sin seeders.

- Para entrega formal Android se publicará una GitHub Release automática con APK release firmada, no artifact ZIP, después de pasar tests, linter y build Android. La keystore se guarda solo como GitHub Secret en base64 y los archivos .jks/.keystore quedan ignorados por Git.

- Para builds reproducibles en CI/APK, Vite no dependerá de la descarga remota de Bunny Fonts; si se requiere Instrument Sans exacta, se deberá autoalojar la fuente en el repositorio/public.

- Para evitar líneas rectas irreales, la geometría de rutas oficiales debe dibujarse/editarse desde mapa con Leaflet.draw; el textarea GeoJSON manual deja de ser la UX principal.
- Las experiencias multimedia de ciclistas se modelan como archivos de valoración (`archivos_valoracion_ruta`), no como imágenes de la ruta oficial; su visibilidad depende de la moderación de la valoración.
- n8n sigue siendo integración externa pendiente: si el webhook no está configurado no se considera bug del rol ciclista ni del frontend.

- Todo texto visible para usuarios debe mantenerse en español. Se permiten nombres técnicos, acrónimos y variables operativas sin traducir cuando cambiarlos puede confundir o romper integración: n8n, TOTP, POI, GPS, HTTPS, APP_KEY, APP_URL, GeoJSON, PostGIS, Leaflet, OSM/Nominatim, route_id.
- La aplicación debe operar con locale español (`APP_LOCALE=es`). Si producción define explícitamente `APP_LOCALE=en`, debe cambiarse en variables de entorno para que validaciones, correos y fechas relativas salgan en español.

- El género de usuario no es libre ni enum frontend: se maneja como catálogo en la tabla `generos`, pero la aplicación solo permite `masculino` y `femenino`. Valores heredados como `otro` o `prefiero no decir` no deben mostrarse ni aceptarse en registro, perfil o administración.

- Para elevación se recomienda OpenTopoData como primera opción open source. En producción debe consumirse desde backend Laravel como proxy o despliegue self-hosted/controlado con DEM (SRTM/Copernicus u otro dataset), evitando llamadas directas desde frontend/APK y sin hardcodear claves/URLs privadas.
- El rediseño visual de cierre debe ser solo cosmético: tokens, superficies, bordes, sombras y espaciados; no debe reordenar componentes ni cambiar lógica de negocio durante la adaptación a bocetos.

- OpenTopoData se integra como proxy backend Laravel, no como llamada directa desde frontend/APK. El dataset/base URL/interpolación quedan configurables por entorno para permitir public API en pruebas o self-hosted en producción.
- La persistencia de memoria conversacional del asistente IA pertenece al workflow de n8n (nodo Agente/memory). Laravel solo actúa como proxy seguro y no debe crear mensajes/conversaciones locales en cada envío; las tablas existentes se mantienen sin borrarse para compatibilidad o migración futura.

- La dirección visual final para usuario móvil es flat design: sin degradados decorativos, sin radios excesivos y con densidad suficiente para uso en campo.
- Las pantallas móviles largas deben dividirse con tabs locales cuando mezclen contextos diferentes (mapa, detalle, comentarios/opiniones, historial, offline, reportes), evitando tabs que modifiquen la URL para no afectar el botón atrás.
- La UI de usuario final no debe exponer nombres de implementación o moderación interna como n8n, Laravel, webhook, proxy, “comentarios aprobados” o “revisión administrativa”; esos términos quedan reservados para admin/configuración/documentación técnica.

- Para corregir el botón atrás físico de Android se usa el plugin oficial `@capacitor/app`; los tabs locales no modifican URL y el listener global decide entre `window.history.back()`, volver al home por rol o salir solo desde la raíz.

- El agente n8n no usará embeddings para datos del producto; consultará Laravel mediante tools HTTP protegidas para obtener rutas, POIs, alertas y progreso desde la BD real.
- Las tools del agente no requieren tablas nuevas: usan rutas, geometrias, metricas, puntos_interes, ruta_punto_interes, incidencias y recorridos existentes. La ubicación enviada al agente será transitoria.
- Las tools `/api/agent/*` se protegen con `GUARANDA_GO_AGENT_TOOL_TOKEN`; el token solo vive en servidor/n8n y nunca en frontend/APK.

## 2026-08-27 — Context engineering adaptado

- Se adopta el enfoque de contexto versionado de `Elvis-WDev/ExpressJS-agent-context`, adaptado al stack y estado real de Guaranda Go; no se incorporan sus decisiones de Express, Next.js, Prisma, Better Auth ni pnpm.
- `ARCHITECTURE.md` y `docs/` son la capa transversal para mapa técnico, especificaciones futuras, Definition of Done, revisión, rendimiento, observabilidad, seguridad, amenazas y ADRs.
- `.codex/` conserva el conocimiento detallado y operativo ya existente: dominio, arquitectura específica, reglas, fases, planes y progreso. Las capas se enlazan en lugar de duplicar especificaciones largas.
- Se agregan procedimientos reutilizables en `.agents/skills/` para implementar funcionalidades, migraciones, frontend operativo, seguridad, rendimiento, revisión, documentación y commits; complementan los skills Laravel/React/Fortify/Pest/Tailwind/Wayfinder existentes.

## 2026-08-27 — Documentación de librerías y componentes UI

- Context7 se mantiene como consulta obligatoria para APIs, métodos, configuraciones y patrones actualizados de dependencias externas; Laravel Boost se prioriza para paquetes Laravel instalados.
- Las tareas con shadcn/ui cargan el skill `shadcn`, consultan el contexto/documentación del CLI antes de usar componentes y reutilizan los componentes/tokens instalados antes de crear alternativas personalizadas.
- Agregar o actualizar componentes shadcn exige inspección previa de registry, API y diff; sobrescribir componentes locales requiere autorización explícita.

## 2026-08-27 — Tokens visuales centralizados

- `resources/css/app.css` es la única fuente de verdad de radios, alturas de controles/acciones y elevaciones de Guaranda Go.
- Se adopta la escala `tight`, `compact`, `control`, `surface`, `emphasis`, `map`, `pill` y `circle`; los radios Tailwind estándar se mapean a ella.
- `rounded-full`/`rounded-none` son excepciones semánticas; no se añaden radios numéricos arbitrarios en JSX/CSS cuando un token cubra el caso.
- El análisis recurrente se realiza con `temp/audit_ui_tokens.py`; el script no modifica código ni reemplaza una revisión visual.

## 2026-08-27 — Tipografía nativa por plataforma

- Se elimina la carga de `CicloSans` de la interfaz y sus preloads. La tipografía global usa la pila de sistema: San Francisco en Apple mediante `-apple-system`, Segoe UI en Windows, Roboto en Android y respaldos estándar.
- No se instala ni se distribuye una fuente externa para la UI; el navegador resuelve la fuente disponible en cada dispositivo.

## 2026-08-27 — Skeletons automáticos con Boneyard

- Boneyard no se usa como overlay global de visitas Inertia: el estado `loading` debe pertenecer a la superficie de datos que realmente espera una respuesta. Autenticación y mutaciones conservan su feedback propio.
- La generación se automatiza por componentes Boneyard nombrados que tengan una ruta o fixture de desarrollo explícita. Se rechaza un watcher global: Laravel/Inertia no sirve las páginas desde Vite y el crawler recorrería formularios/rutas sin carga de datos. Los bones generados permanecen versionados.
- Las capturas autenticadas usan fixtures o un entorno local preparado; no se guardan secretos en configuración.

## 2026-08-27 — Rotación de credencial PostgreSQL remota

- La aplicación usa el rol de mínimo privilegio `guaranda_go_app` para `guaranda_go_db`; las rotaciones se realizan con una credencial administrativa externa al repositorio y se validan iniciando sesión con el rol de aplicación.
- La contraseña rotada reside exclusivamente en el almacén local de credenciales y en la configuración de despliegue correspondiente; nunca en Git, código, documentación ni APK.

## 2026-08-27 — Landing de escritorio y móvil

- La landing usa una estructura responsive de hero y cuadrícula bento: escritorio aprovecha el ancho disponible y móvil mantiene una secuencia única con CTA accesibles.
- Las referencias externas de 21st.dev se adaptan a los componentes y tokens locales; no se instalan ni copian estilos que contradigan el diseño flat, los radios globales, la tipografía nativa o las rutas existentes.

## 2026-08-27 — Radios compactos y bloques de autenticación

- Todos los radios no circulares se reducen aproximadamente 30 % mediante `resources/css/app.css`; el sistema mantiene una única escala global.
- Los bloques `login-01` y `signup-03` de shadcn sirven como composición de referencia, pero no sobrescriben las primitives locales ni reemplazan los formularios Fortify. Se adaptan a los campos y rutas tipadas reales de Guaranda Go.

## 2026-08-27 — Densidad responsive de autenticación

- El shell de login/registro mantiene el diseño de una columna en móvil. Desde escritorio, login conserva una tarjeta de lectura cómoda y registro distribuye pares de campos en dos columnas para reducir su altura sin alterar el contrato Fortify ni el orden de teclado.

## 2026-08-27 — Tema y contraste en landing

- La landing dispone de un único control de tema por icono en su encabezado: alterna claro y oscuro sin depender de un texto visible. Se apoya en `useAppearance`, que persiste y aplica la preferencia explícita.
- Las superficies oscuras no reutilizan `background` como color de texto: se usan tokens inversos globales para que el contraste no dependa del modo activo.

## 2026-08-27 — Tema binario con transición expansiva

- La preferencia global de apariencia queda reducida a `light` y `dark`; el valor heredado `system` se migra una sola vez al tema efectivo del dispositivo y se persiste como elección explícita.
- El cambio iniciado desde un control de tema revela la nueva apariencia mediante una onda circular originada en el botón. La implementación usa View Transitions como mejora progresiva y aplica el cambio inmediato cuando la API no está disponible o el usuario solicita movimiento reducido.
- El botón global de tema consume el mismo contrato de apariencia en todas las vistas web y en el contenedor Capacitor.

## 2026-08-27 — Navegación del módulo administrativo de POIs

- POIs oficiales, sugerencias y reportes se presentan como secciones locales del módulo de POIs, en vez de concentrar la retroalimentación pendiente sobre el listado principal.
- La navegación global no añade un tercer nivel; cada sección conserva URL propia, autorización administrativa y paginación.

## 2026-08-27 — Autodespliegue directo en Dokploy

- Dokploy realiza el despliegue por su detección nativa de `push`; el flujo habitual no depende de GitHub Actions como condición previa.
- `android-apk`, `tests` y `linter` se conservan para ejecución manual mediante `workflow_dispatch`, sin checks automáticos en pushes ni pull requests mientras esta decisión esté activa.

## 2026-08-27 — AI Elements desacoplado del proveedor

- AI Elements se incorpora exclusivamente como biblioteca fuente de interfaz; no reemplaza n8n, no modifica endpoints y no introduce todavía `useChat` en la pantalla existente.
- Se instala un conjunto acotado para conversación, mensajes, prompt, adjuntos, sugerencias, fuentes, razonamiento, tools y confirmaciones. No se instala el catálogo completo.
- La futura integración depende del contrato que entregue el nuevo backend del agente. Hasta entonces los componentes permanecen compilables, localizados y sin consumidores de producción.
- Las primitives locales de shadcn tienen prioridad sobre el registry externo y no se sobrescriben durante instalación o actualización.

## 2026-08-28 — Agente nativo Laravel/OpenAI y conocimiento derivado

- Se sustituirá n8n en el flujo de Guaranda Go por una integración servidor a servidor desde Laravel hacia OpenAI. n8n no se borra del VPS porque puede servir a otros sistemas, pero deja de ser dependencia del chat de esta app al completar la transición.
- AI Elements se conserva como capa visual agnóstica: componentes fuente React/shadcn, no un backend, gateway ni proveedor. Laravel conserva el contrato del chat.
- PostgreSQL es fuente de verdad. El índice vectorial es una proyección idempotente cuyos resultados se revalidan contra los modelos vivos antes de mostrarse.
- La descripción automática de imágenes queda limitada inicialmente a medios editoriales administrados de rutas/POIs; incidencias de ciclistas quedan fuera por privacidad.
- La infraestructura vectorial queda aplazada: no se modifica la instancia PostgreSQL central hasta tener inventario de bases, ventana de mantenimiento y rollback probado.

## 2026-07-01 — Historial local posterior a n8n

- Decisión: Laravel puede persistir `conversaciones_ia`/`mensajes_ia` después de que n8n responda, para mostrar historial en la app sin guardar mensajes al momento de escribir.
- n8n sigue siendo el proceso externo del agente y memoria; Laravel mantiene solo historial visible para el usuario.

## 2026-07-01 - Refactor frontend mobile first

- Se crea Fase 16 para rediseño integral mobile first del frontend, cubriendo auth, ciclista, admin, ajustes y componentes base sin cambiar lógica de negocio ni rutas.
- Dirección visual aprobada para implementación: `Guaranda Go - Andean Field UI`, con verde andino como primary, azul montaña como secondary, naranja sendero para alertas y tipografía Sora + IBM Plex Sans.
- `sonner` ya existe y se mantiene como sistema de toast; se debe adaptar a móvil con posición bottom-center y offset sobre bottom nav.
- Stitch queda como herramienta de diseño para referencias visuales, pero la implementación final vive en `ciclismo-guaranda/resources/js` y `resources/css/app.css`.

- La dirección visual final del frontend queda basada en el clon visual de `ciclismo-ueb`: tema oscuro mobile first, `CicloSans`, superficies #0d0f0d/#151815/#1c1f1c y acento lime #b2f000. La dirección Andean Field UI queda descartada por feedback del usuario.
- El icono original de Guaranda Go no debe reemplazarse por assets de `ciclismo-ueb`; los assets importados se usan solo como referencia/fuentes si aplica.

- El chat renderiza un subconjunto seguro de Markdown directamente con React, sin `dangerouslySetInnerHTML` y sin agregar dependencias; cubre el formato actual del agente n8n: negritas, saltos de párrafo y listas.
- Ocultar conversaciones del asistente mantiene `SoftDeletes` como mecanismo de privacidad/trazabilidad: desaparece para el usuario autenticado, pero no se elimina físicamente de la BD.

- Las notificaciones internas usan la tabla existente `notificaciones_app`; no se crea una tabla nueva ni se eliminan notificaciones desde UI. El usuario solo puede ver sus propias notificaciones y marcarlas como leídas.
- El acceso principal a notificaciones será un ícono de campana global con contador de no leídas; al pulsarlo navega a `/notifications`.

## 2026-07-01 — Ubicación para asistente y recomendaciones

- La app mantiene modo limitado sin ubicación: permite rutas, detalles, POIs, alertas, chat básico y clima referencial de Guaranda.
- Las funciones de cercanía, recomendación personalizada, progreso y distancia restante requieren ubicación explícita del usuario.
- La ubicación compartida con el asistente es transitoria (`latitude`, `longitude`, `accuracy_m`, `recorded_at`) y se envía al webhook n8n sin guardarse en `conversaciones_ia` ni `mensajes_ia`.
- `buscar_rutas` debe tolerar consultas genéricas: si `query` no devuelve resultados, Laravel responde rutas activas generales para que el agente aún pueda recomendar sin inventar.

## 2026-08-27 — Retícula de rutas del ciclista

- El catálogo de rutas no usa una tarjeta destacada que cambie la escala del primer resultado; todas las rutas mantienen la misma jerarquía para facilitar comparación y aprovechar el escritorio.
- La retícula responsive queda en 1/2/3 columnas para móvil/tablet/laptop y ocupa el ancho disponible del shell sin el límite histórico de 760 px.
- La paginación de catálogos replica el patrón operativo del administrador y se implementa como componente compartido para rutas y favoritas.
- La portada forma parte del contrato de favoritas; se expone solo el path ya autorizado que consume `mediaUrl`, sin modificar permisos ni almacenamiento.

## 2026-08-27 — Refinamiento de login y onda de tema

- El ancho y radio mayores se aplican solo al login de escritorio; no se modifica la escala global de superficies ni el ancho del registro.
- La introducción del formulario permanece centrada en todos los breakpoints, mientras labels y campos conservan alineación de lectura a la izquierda.
- La onda de tema usa una curva de entrada progresiva de 1,4 segundos. El `color-scheme` nativo se difiere hasta el cierre de la transición para que scrollbar y controles no cambien antes que la superficie visible.
- El estado inicial del pseudo-elemento nuevo se define en CSS con coordenadas preparadas antes de `startViewTransition`; JavaScript anima desde ese mismo círculo. Esto elimina la carrera de un frame donde el tema nuevo podía aparecer completo antes del recorte.

## 2026-07-02 — Modelo IA generando texto corrupto (glitch tokens)

- Se detectó que el nodo `ia` de n8n (modelo configurado como `"gpt-5.4"`, no es un modelo oficial de OpenAI) genera texto de salida con basura mezclada: sintaxis de tool-call filtrada como texto plano (`to=functions.rutas ... json\n{...}`) y tokens en chino/tailandés/malabar tipo spam de casino, intercalados dentro de la llamada a la tool.\n- La respuesta final visible para el usuario seguía siendo correcta porque el texto limpio queda al final del string, después del último bloque `to=functions...{...}`.\n- Causa raíz: el modelo/endpoint configurado no es un modelo oficial confiable; probablemente un proxy o alias de un modelo cuantizado/contaminado. No es un bug de Laravel ni de los endpoints `/api/agent/*`.\n- Mitigación aplicada (band-aid, no soluciona la causa raíz): se reforzó el nodo `Normalizar respuesta` en `.codex/project/n8n_workflow.md` para detectar el patrón `to=functions.NOMBRE` y quedarse solo con el texto posterior al último bloque de ese tipo, antes de aplicar el parseo de JSON existente.\n- Recomendación pendiente para el usuario: cambiar el modelo configurado en el nodo `ia` por un modelo real y confiable (ej. un modelo oficial de OpenAI o un endpoint de DeepSeek verificado), ya que el parche solo esconde el síntoma.\n

## 2026-08-27 — SSR seguro para dependencias de mapa

- Leaflet, Leaflet Draw, geocodificación y componentes React Leaflet no se importan desde páginas Inertia ni desde sus dependencias estáticas. Se cargan después de la hidratación con `useEffect`, conservando SSR activo para el resto de cada pantalla.
- `/up` queda como endpoint mínimo de preparación del contenedor y no depende de la ejecución de SSR; Dokploy debe consultar esa ruta antes de conmutar tráfico.

## 2026-08-27 — OSRM privado como asistente del editor de rutas

- Se adopta OSRM autoalojado para Ecuador y perfil de bicicleta como generador inicial de la geometría administrativa; no se convierte en endpoint público ni se entrega su URL al cliente.
- El contrato Laravel devuelve solo GeoJSON, distancia y minutos normalizados. El navegador nunca compone una URL de OSRM y las coordenadas pasan por Form Request, policy de creación y rate limit antes de llegar al motor.
- El editor no depende del motor para guardar: ante `NoRoute`, timeout o caída, el administrador puede ajustar los puntos o dibujar la ruta manualmente.

## 2026-08-28 — Readiness del contenedor ante reinicios

- Nginx no publica la aplicación hasta que PHP-FPM acepta conexiones en `127.0.0.1:9000`; esto evita respuestas 502 durante la carrera de arranque del contenedor.
- La imagen declara `HEALTHCHECK` contra `/up` y Dokploy debe esperar el estado `healthy` antes de enviar tráfico al contenedor nuevo.
- Las cabeceras `X-Forwarded-Host` y `X-Forwarded-Proto` se entregan a PHP solo cuando el proxy realmente las envía; un chequeo interno sin dichas cabeceras no debe producir un 500.

## 2026-08-28 — Editor de rutas guiado y sin jerga técnica

- La creación/edición de rutas se presenta como un flujo de cuatro pasos dentro de un cuadro centrado, porque la captura completa de una ruta es demasiado extensa para una hoja lateral convencional.
- En escritorio el cuadro aprovecha el ancho disponible hasta 1152 px; en móvil conserva márgenes táctiles y se adapta a la pantalla.
- El valor de `routing_engine_id` permanece interno y se envía con el valor por defecto existente; el administrador no debe elegir el motor que genera el trazado.
- La capa satelital se mantiene mediante Esri World Imagery como conmutador visual del editor, sin claves ni llamadas desde el backend.

## 2026-08-28 — Alta de POIs dentro del listado

- Crear o editar un POI es un flujo administrativo que conserva el contexto de búsqueda; se resuelve en una sheet con pie fijo y no en una página independiente. Las URLs históricas de creación/edición redirigen al listado con la sheet abierta para no romper accesos existentes.

## 2026-08-28 — Tipografía Arial como base visual

- Arial pasa a ser la tipografía principal de interfaz y de títulos, con Helvetica/sans-serif como respaldo. Se retira la importación de Inter Variable para evitar una apariencia demasiado pesada y una descarga de fuente innecesaria.

## 2026-08-28 — Readiness rápida y segura en Docker

- Se conserva la espera de PHP-FPM y el health check `/up` para no reintroducir 502 durante los despliegues. En Docker Engine 29, el health check sondea cada 2 s solo durante el periodo de arranque y pasa a su intervalo normal de 10 s tras el primer éxito.

## 2026-08-28 — Compilación Docker acotada y reproducible

- Las extensiones PHP se compilan con dos procesos por defecto para no depender del número de CPU ni agotar la memoria disponible en Dokploy.
- APT y NodeSource usan reintentos ante fallos transitorios, y la extensión PhpRedis queda fijada a `6.3.0`, versión validada con PHP 8.4.
- La instalación del sistema, Node.js y extensiones PHP se mantiene en etapas separadas para que los fallos de construcción sean identificables y reutilicen caché.

## 2026-08-28 — Retiro de Boneyard y transición estándar de sheets

- Se retira `boneyard-js` y sus archivos generados. Los skeletons de shadcn permanecen solo como estados de carga locales, sin reemplazar toda la pantalla durante la navegación.
- `SheetContent` queda deliberadamente restringido al lateral derecho para impedir variantes inconsistentes desde la izquierda, arriba o abajo.

## 2026-08-28 — Valores visibles de catálogos y estados

- Los catálogos y estados mostrados a usuarios se almacenan con inicial mayúscula. Se usa una migración de mapeo explícito y reversible, no una conversión masiva de texto, para preservar siglas como `MTB`, `OSRM`, `GPX`, `GeoJSON` y `OpenRouteService`.
- Los valores de protocolo (`event_type` offline, roles de IA, tipos de notificación/archivo, GeoJSON y filtros URL) siguen siendo identificadores técnicos y no se capitalizan.
- La cola offline admite temporalmente sus valores previos en minúscula para que datos ya guardados en IndexedDB se sincronicen después de actualizar la app.

## 2026-08-28 — Normalización segura de roles heredados

- `Administrador` y `Ciclista` son los valores canónicos de autorización y navegación.
- Cuando coexiste el rol heredado en minúscula, la migración mueve primero todos los `usuarios.role_id` al registro canónico y después elimina el duplicado. La consolidación no intenta recrear duplicados al revertir porque no puede recuperar qué usuarios pertenecían originalmente a cada fila.

## 2026-08-28 — Bandejas de notificaciones separadas por rol

- La ruta visible y las mutaciones del administrador viven bajo `/admin/notifications`; las de ciclista viven bajo `/user/notifications`.
- Ambas bandejas reutilizan `notificaciones_app` y exigen que cada fila pertenezca al usuario autenticado. Separar tablas no aporta autorización adicional y sí duplicaría datos.

## 2026-08-28 — Namespace de la experiencia ciclista

- Las rutas web del ciclista usan el prefijo `/user`: rutas, favoritas, notificaciones, asistente, recorridos, sync, incidencias, POIs, perfil y seguridad.
- Los nombres de ruta Laravel se conservan para mantener compatibles controladores, Fortify, Wayfinder y APKs; los accesos GET históricos redirigen al namespace nuevo.

## 2026-08-28 — Catálogo de rutas de ciclista alineado al administrativo

- El catálogo de ciclista reutiliza la barra de filtros administrativa con búsqueda, categoría y dificultad; el estado se omite porque solo se exponen rutas activas.
- Las tarjetas comparten la misma jerarquía de imagen, datos de ubicación y métricas que la gestión administrativa, sin exponer acciones administrativas.
- Notificaciones no pertenece a la navegación del ciclista: queda accesible desde la campana global; Favoritas ocupa ese lugar en la navegación principal y móvil.

## 2026-08-28 — Retiro de n8n del asistente

- Se adopta Laravel como frontera única del asistente y OpenAI Responses como proveedor externo, con `store: false`, configuración exclusiva de servidor y contrato JSON Schema validado.
- Las tools HTTP y el token de n8n se retiran porque Laravel recupera los datos públicos vivos directamente; no se elimina el servicio n8n compartido del VPS.

## 2026-08-28 — Configuración de modelos OpenAI GPT-5.6

- El chat usa una lista cerrada configurable por administrador: `gpt-5.6-luna`,
  `gpt-5.6-terra` o `gpt-5.6-sol`, junto con el esfuerzo de razonamiento
  permitido. La clave sigue siendo un secreto exclusivo de Dokploy.
- Las descripciones editoriales de imagen usan por defecto `gpt-5.6-luna`,
  detalle bajo y esfuerzo `none`, para mantener costo bajo sin procesar fotos
  de incidencias.
- `text-embedding-3-large` queda reservado para retrieval semántico tras un
  preflight pgvector correcto; no se convierte en dependencia del chat vivo ni
  dispara migraciones antes de tiempo.
- La ubicación no forma parte de la persistencia de conversaciones. El modelo recibe solo contexto público acotado, ubicación temporal si fue autorizada y ocho mensajes recientes truncados.
- AI Elements se usa sin plugins de Markdown avanzados que no corresponden al producto, para proteger la descarga de la app móvil.

## 2026-08-28 — Contexto turístico vivo antes de embeddings

- El chat recibe directamente desde Laravel los horarios y detalles públicos
  de POIs de comida, hospedaje, tienda, taller y salud. Esto permite resolver
  los cuatro momentos turísticos sin esperar pgvector y conserva el filtro de
  recursos activos en el instante de responder.

## 2026-08-28 — Proyección pgvector reconstruible

- La base central queda en PostgreSQL 18 con PostGIS 3.6.4 y pgvector 0.8.6
  verificados. La extensión `vector` se habilitó solo en `guaranda_go_db`.
- `documentos_conocimiento_ia` será una proyección sin claves foráneas ni PII:
  su identidad es `document_key`, porque un POI puede aparecer en varias rutas.
  El HNSW usa coseno sobre `halfvec(3072)` de `text-embedding-3-large`.
- El vector solo selecciona candidatos. Laravel reconsulta rutas activas, POIs
  activos y alertas visibles, de modo que un embedding atrasado nunca autoriza
  una respuesta ni una tarjeta obsoleta.

## 2026-08-28 — Chat operativo con AI Elements

- La pantalla de asistente se compone con `Conversation`, `Message`,
  `PromptInput`, `Suggestion` y `Sources` ya instalados en el repositorio. No
  se incorpora un segundo transporte de chat ni se expone OpenAI al cliente.
- Los controles opcionales de ruta, tipo de visita y ubicación se agrupan en
  “Personalizar”; la entrada principal se mantiene como una sola pregunta.
