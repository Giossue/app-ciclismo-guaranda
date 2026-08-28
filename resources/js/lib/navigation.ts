import { Bot, Heart, Map, Route } from 'lucide-react';
import { adminNavItems } from '@/lib/admin-navigation';
import { index as chatIndex } from '@/routes/chat';
import { index as favoritesIndex } from '@/routes/favorites';
import { index as mapsIndex } from '@/routes/maps';
import { index as routesIndex } from '@/routes/routes';
import { dashboard as cyclistDashboard } from '@/routes/user';
import type { Auth, NavItem } from '@/types';

const cyclistNavItems: NavItem[] = [
    {
        title: 'Explorar',
        href: mapsIndex.url(),
        icon: Map,
    },
    {
        title: 'Rutas',
        href: routesIndex.url(),
        icon: Route,
    },
    {
        title: 'Favoritas',
        href: favoritesIndex.url(),
        icon: Heart,
    },
    {
        title: 'Asistente IA',
        href: chatIndex.url(),
        icon: Bot,
    },
];

export function isAdmin(auth: Auth): boolean {
    return auth.user?.role?.name === 'Administrador';
}

export function homePath(auth: Auth): string {
    return isAdmin(auth) ? '/admin/dashboard' : cyclistDashboard.url();
}

export function mainNavItems(auth: Auth): NavItem[] {
    return isAdmin(auth) ? adminNavItems : cyclistNavItems;
}

export function mobilePrimaryNavItems(auth: Auth): NavItem[] {
    if (!isAdmin(auth)) {
        return [
            cyclistNavItems.find((item) => item.href === mapsIndex.url()),
            cyclistNavItems.find((item) => item.href === chatIndex.url()),
        ].filter((item): item is NavItem => Boolean(item));
    }

    return [
        adminNavItems.find((item) => item.href === '/admin/dashboard'),
        adminNavItems.find((item) => item.href === '/admin/routes'),
        adminNavItems.find((item) => item.href === '/admin/incidents'),
    ].filter((item): item is NavItem => Boolean(item));
}
