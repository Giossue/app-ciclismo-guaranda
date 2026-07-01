import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBellLink } from '@/components/notification-bell-link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-input bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:h-16 md:px-5">
            <SidebarTrigger className="-ml-1 hidden rounded-full border border-input bg-card text-foreground hover:border-primary hover:text-primary md:inline-flex" />
            <div className="min-w-0 flex-1">
                {breadcrumbs.length > 0 ? (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                ) : (
                    <span className="text-sm font-black tracking-[-0.02em] text-foreground">
                        Guaranda Go
                    </span>
                )}
            </div>
            <NotificationBellLink />
        </header>
    );
}
