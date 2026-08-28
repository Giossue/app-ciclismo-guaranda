# Navegación y responsive

- En móvil, la navegación principal es bottom navbar con acceso a Más; sidebar para desktop/tablet. No crear un tercer nivel de navegación.
- Sidebar y Más son el mismo componente (`AppSidebar`): en escritorio se muestra como panel lateral y en móvil como sheet con tarjetas (`AppSidebarMenu`). «Más» solo abre ese sheet; no existe una página de menú aparte.
- Cada módulo tiene título propio. Las áreas que poseen registros, acciones o permisos diferentes son submódulos de navegación, no una página de tabs globales.
- Tabs locales solo separan contextos de una pantalla extensa y no cambian la URL cuando afectaría el botón atrás físico Android.
- Mantener acciones críticas del recorrido visibles; respetar safe areas y no esconder controles bajo la navegación inferior.
- Verificar en ancho estrecho, teclado abierto, texto largo y orientación/capacidad de WebView que corresponda.

La interfaz es mobile first pero las tareas administrativas repetidas deben conservar eficiencia de escaneo en pantalla amplia.
