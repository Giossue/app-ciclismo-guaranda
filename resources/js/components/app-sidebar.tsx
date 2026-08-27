import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLayoutPreferences } from '@/hooks/use-layout-preferences';
import { useIsMobile } from '@/hooks/use-mobile';
import { homePath, mainNavItems } from '@/lib/navigation';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const isMobile = useIsMobile();
    const { preferences } = useLayoutPreferences();
    const navItems = mainNavItems(auth);
    const startPath = homePath(auth);

    if (isMobile) {
        return null;
    }

    return (
        <Sidebar
            collapsible={preferences.sidebarCollapsible}
            variant={preferences.sidebarVariant}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={startPath} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
