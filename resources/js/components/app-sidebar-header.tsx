import { usePage } from '@inertiajs/react';
import AppearanceCycleButton from '@/components/appearance-cycle-button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBellLink } from '@/components/notification-bell-link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const userFullName = auth.user
        ? [auth.user.name, auth.user.last_name].filter(Boolean).join(' ')
        : '';

    return (
        <header
            data-slot="app-sidebar-header"
            className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6"
        >
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
                <Separator
                    orientation="vertical"
                    className="hidden h-4 md:block"
                />
                {/*
                 * En móvil la miga repetiría el título que la propia pantalla
                 * ya muestra debajo, así que ahí se deja solo la marca.
                 */}
                <span className="truncate text-sm text-muted-foreground md:hidden">
                    Guaranda Go
                </span>
                <div className="hidden min-w-0 text-sm text-muted-foreground md:block">
                    {breadcrumbs.length > 0 ? (
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    ) : (
                        'Guaranda Go'
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <NotificationBellLink />
                <AppearanceCycleButton />
                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Abrir menú de usuario"
                                className="size-9 rounded-full p-1"
                            >
                                <Avatar className="size-7">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={userFullName}
                                    />
                                    <AvatarFallback>
                                        {getInitials(userFullName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
