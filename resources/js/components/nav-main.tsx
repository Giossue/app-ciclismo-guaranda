import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-2">
            <SidebarGroupLabel className="px-2 text-xs text-sidebar-foreground/60">
                Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        'relative min-h-10 rounded-[var(--radius-control)] font-medium',
                                        // Indicador de ubicación: tinte de marca, texto en --link
                                        // y barra lateral, visible también con el sidebar colapsado.
                                        'data-[active=true]:bg-primary/12 data-[active=true]:font-semibold data-[active=true]:text-link',
                                        'data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary data-[active=true]:before:content-[""]',
                                    )}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
