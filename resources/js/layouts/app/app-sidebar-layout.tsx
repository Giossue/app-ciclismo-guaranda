import { AppContent } from '@/components/app-content';
import { AppMobileNav } from '@/components/app-mobile-nav';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden overflow-y-auto"
            >
                <main className="safe-bottom-pad ueb-admin-page flex flex-1 flex-col gap-[var(--page-gap)] px-[var(--page-pad-x)] pt-[var(--page-pad-y)] md:pb-[var(--page-pad-y)]">
                    {children}
                </main>
                <AppMobileNav />
            </AppContent>
        </AppShell>
    );
}
