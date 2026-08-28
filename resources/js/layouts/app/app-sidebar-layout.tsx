import { AppContent } from '@/components/app-content';
import { AppMobileNav } from '@/components/app-mobile-nav';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
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
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="safe-bottom-pad ueb-admin-page flex flex-1 flex-col gap-[var(--page-gap)] px-[var(--page-pad-x)] pt-[var(--page-pad-y)] md:pb-[var(--page-pad-y)]">
                    {children}
                </main>
                <AppMobileNav />
            </AppContent>
        </AppShell>
    );
}
