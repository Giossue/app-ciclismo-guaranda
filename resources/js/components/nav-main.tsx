import { Link, usePage } from '@inertiajs/react';
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
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type AdminCounters = Partial<Record<NonNullable<NavItem['badgeKey']>, number>>;

/** Marca de pendientes: un punto basta; el número queda para lectores de pantalla. */
function PendingDot({ count }: { count: number }) {
    return (
        <>
            <span
                aria-hidden="true"
                className="block size-2 rounded-full bg-destructive"
            />
            <span className="sr-only">
                {count} pendiente{count === 1 ? '' : 's'}
            </span>
        </>
    );
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();
    const counters =
        (usePage().props.adminCounters as AdminCounters | null) ?? {};

    /** Solo se pinta si hay pendientes: un cero no aporta nada. */
    const pending = (item: NavItem): number =>
        item.badgeKey ? (counters[item.badgeKey] ?? 0) : 0;

    /**
     * Solo se marca el subelemento más específico: `/admin/pois/reports` empieza
     * por `/admin/pois`, así que sin esto se encenderían dos a la vez.
     */
    const activeChildUrl = (children: NavItem[]): string | null => {
        const matches = children.filter((child) =>
            isCurrentOrParentUrl(child.href),
        );

        if (matches.length === 0) {
            return null;
        }

        return matches
            .map((child) => toUrl(child.href))
            .reduce((best, url) => (url.length > best.length ? url : best));
    };

    return (
        <SidebarGroup className="px-2 py-2">
            <SidebarGroupLabel className="px-2 text-xs text-sidebar-foreground/60">
                Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                    {items.map((item) => {
                        const itemPending =
                            pending(item) +
                            (item.children?.reduce(
                                (total, child) => total + pending(child),
                                0,
                            ) ?? 0);
                        const active = Boolean(
                            isCurrentOrParentUrl(item.href) ||
                            item.children?.some((child) =>
                                isCurrentOrParentUrl(child.href),
                            ),
                        );

                        if (item.children?.length) {
                            const currentChildUrl = activeChildUrl(
                                item.children,
                            );

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
                                                'min-h-10 rounded-[var(--radius-control)] font-normal',
                                                'data-[active=true]:bg-primary/12 data-[active=true]:font-normal data-[active=true]:text-link',
                                            )}
                                        >
                                            <Link
                                                href={item.href}
                                                prefetch
                                                aria-label={
                                                    itemPending > 0
                                                        ? `${item.title}: ${itemPending} pendientes`
                                                        : undefined
                                                }
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
                                        {itemPending > 0 && (
                                            <SidebarMenuBadge className="right-8">
                                                <PendingDot
                                                    count={itemPending}
                                                />
                                            </SidebarMenuBadge>
                                        )}
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction
                                                aria-label={`Mostrar secciones de ${item.title}`}
                                            >
                                                <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                            <SidebarMenuSub>
                                                {item.children.map((child) => {
                                                    const childPending =
                                                        pending(child);
                                                    const childActive =
                                                        toUrl(child.href) ===
                                                        currentChildUrl;

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
                                                                    aria-label={
                                                                        childPending >
                                                                        0
                                                                            ? `${child.title}: ${childPending} pendientes`
                                                                            : undefined
                                                                    }
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
                                                                    {childPending >
                                                                        0 && (
                                                                        <span className="ml-auto">
                                                                            <PendingDot
                                                                                count={
                                                                                    childPending
                                                                                }
                                                                            />
                                                                        </span>
                                                                    )}
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
                                        'min-h-10 rounded-[var(--radius-control)] font-normal',
                                        // Indicador de ubicación: tinte de marca y texto en --link.
                                        'data-[active=true]:bg-primary/12 data-[active=true]:font-normal data-[active=true]:text-link',
                                    )}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                        aria-label={
                                            itemPending > 0
                                                ? `${item.title}: ${itemPending} pendientes`
                                                : undefined
                                        }
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {itemPending > 0 && (
                                    <SidebarMenuBadge>
                                        <PendingDot count={itemPending} />
                                    </SidebarMenuBadge>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
