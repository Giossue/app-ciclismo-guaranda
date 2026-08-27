import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBellLink } from '@/components/notification-bell-link';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header
            data-slot="app-sidebar-header"
            className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6"
        >
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
                <Separator
                    orientation="vertical"
                    className="hidden h-4 md:block"
                />
                <div className="min-w-0 text-sm text-muted-foreground">
                    {breadcrumbs.length > 0 ? (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    ) : (
                        'Guaranda Go'
                    )}
                </div>
            </div>
            <NotificationBellLink className="mr-12" />
        </header>
    );
}
