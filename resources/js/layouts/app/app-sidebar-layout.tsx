import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppMobileNav } from '@/components/app-mobile-nav';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { useDisableNativePullToRefresh } from '@/hooks/use-disable-native-pull-to-refresh';
import { isAdmin } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { AppLayoutProps, Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    // Solo la ruta, sin query: filtrar o paginar no debe reanimar la pantalla.
    const page = usePage<PageProps>();
    const pathname = page.url.split('?')[0];
    const administrator = isAdmin(page.props.auth);
    const isChat = pathname === '/chat';

    useDisableNativePullToRefresh(!administrator);

    // El asistente es una superficie inmersiva: su propio encabezado ofrece
    // la salida a rutas y su conversación controla el único scroll. Montarlo
    // dentro del sidebar/header global deja dos áreas compitiendo por el alto
    // del viewport y hace que el compositor se desplace con la página.
    if (isChat) {
        return (
            <AppShell variant="header">
                <main className="h-[100dvh] min-h-0 w-full overflow-hidden">
                    {children}
                </main>
            </AppShell>
        );
    }

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                // Sin `overflow` propio: un contenedor de scroll aquí rompe el
                // `position: sticky` del encabezado, que quedaría anclado a un
                // elemento que nunca se desplaza. El recorte horizontal ya lo
                // hace `body`.
                className="min-w-0"
            >
                {administrator && <PullToRefresh />}
                <AppSidebarHeader />
                <main
                    key={pathname}
                    className={cn(
                        'ueb-admin-page flex flex-1 animate-in flex-col gap-[var(--page-gap)] px-[var(--page-pad-x)] pt-[var(--page-pad-y)] duration-150 ease-out fade-in',
                        'safe-bottom-pad md:pb-[var(--page-pad-y)]',
                    )}
                >
                    {children}
                </main>
                <AppMobileNav />
            </AppContent>
        </AppShell>
    );
}
