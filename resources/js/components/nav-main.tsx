import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-2">
            <SidebarGroupLabel className="px-2 text-xs text-sidebar-foreground/60">
                Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const active = Boolean(
                            isCurrentOrParentUrl(item.href) ||
                            item.children?.some((child) =>
                                isCurrentOrParentUrl(child.href),
                            ),
                        );

                        if (item.children?.length) {
                            return (
                                <Collapsible
                                    key={`${item.title}-${active ? 'active' : 'inactive'}`}
                                    defaultOpen={active}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={{ children: item.title }}
                                            className={cn(
                                                'min-h-10 rounded-[var(--radius-control)] font-medium',
                                                'data-[active=true]:bg-primary/12 data-[active=true]:font-semibold data-[active=true]:text-link',
                                            )}
                                        >
                                            <Link
                                                href={item.href}
                                                prefetch
                                                aria-current={
                                                    isCurrentUrl(item.href)
                                                        ? 'page'
                                                        : undefined
                                                }
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction
                                                aria-label={`Mostrar secciones de ${item.title}`}
                                            >
                                                <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.children.map((child) => {
                                                    const childActive =
                                                        isCurrentOrParentUrl(
                                                            child.href,
                                                        );

                                                    return (
                                                        <SidebarMenuSubItem
                                                            key={child.title}
                                                        >
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={
                                                                    childActive
                                                                }
                                                            >
                                                                <Link
                                                                    href={
                                                                        child.href
                                                                    }
                                                                    prefetch
                                                                    aria-current={
                                                                        childActive
                                                                            ? 'page'
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <span>
                                                                        {
                                                                            child.title
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={active}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        'min-h-10 rounded-[var(--radius-control)] font-medium',
                                        // Indicador de ubicación: tinte de marca y texto en --link.
                                        'data-[active=true]:bg-primary/12 data-[active=true]:font-semibold data-[active=true]:text-link',
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
