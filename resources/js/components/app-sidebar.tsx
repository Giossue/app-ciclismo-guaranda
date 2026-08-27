import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { AppSidebarMenu } from '@/components/app-sidebar-menu';
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
    useSidebar,
} from '@/components/ui/sidebar';
import { homePath, mainNavItems } from '@/lib/navigation';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const { isMobile } = useSidebar();
    const navItems = mainNavItems(auth);
    const sidebarNavItems = navItems.filter(
        (item) => item.href !== '/notifications',
    );
    const startPath = homePath(auth);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            {isMobile ? (
                <AppSidebarMenu items={sidebarNavItems} />
            ) : (
                <>
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
                        <NavMain items={sidebarNavItems} />
                    </SidebarContent>

                    <SidebarFooter>
                        <NavUser />
                    </SidebarFooter>
                </>
            )}
        </Sidebar>
    );
}
