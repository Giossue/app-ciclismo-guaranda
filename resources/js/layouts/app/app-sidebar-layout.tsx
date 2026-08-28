import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppMobileNav } from '@/components/app-mobile-nav';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PullToRefresh } from '@/components/pull-to-refresh';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    // Solo la ruta, sin query: filtrar o paginar no debe reanimar la pantalla.
    const pathname = usePage().url.split('?')[0];

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
                <PullToRefresh />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main
                    key={pathname}
                    className="safe-bottom-pad ueb-admin-page flex flex-1 animate-in flex-col gap-[var(--page-gap)] px-[var(--page-pad-x)] pt-[var(--page-pad-y)] duration-150 ease-out fade-in md:pb-[var(--page-pad-y)]"
                >
                    {children}
                </main>
                <AppMobileNav />
            </AppContent>
        </AppShell>
    );
}
