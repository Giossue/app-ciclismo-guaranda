import { AppContent } from '@/components/app-content';
import { AppMobileNav } from '@/components/app-mobile-nav';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden overflow-y-auto"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="safe-bottom-pad ueb-admin-page flex w-full flex-1 flex-col gap-[var(--page-gap)] px-0 py-[var(--page-pad-y)] md:px-0">
                    {children}
                </main>
                <AppMobileNav />
            </AppContent>
        </AppShell>
    );
}
