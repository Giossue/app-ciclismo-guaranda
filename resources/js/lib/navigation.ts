import { Bot, Heart, Route } from 'lucide-react';
import { adminNavItems } from '@/lib/admin-navigation';
import { index as chatIndex } from '@/routes/chat';
import { index as favoritesIndex } from '@/routes/favorites';
import { index as routesIndex } from '@/routes/routes';
import type { Auth, NavItem } from '@/types';

const cyclistNavItems: NavItem[] = [
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
    return isAdmin(auth) ? '/admin/dashboard' : routesIndex.url();
}

export function mainNavItems(auth: Auth): NavItem[] {
    return isAdmin(auth) ? adminNavItems : cyclistNavItems;
}

export function mobilePrimaryNavItems(auth: Auth): NavItem[] {
    if (!isAdmin(auth)) {
        return [
            cyclistNavItems.find((item) => item.href === routesIndex.url()),
            cyclistNavItems.find((item) => item.href === favoritesIndex.url()),
            cyclistNavItems.find((item) => item.href === chatIndex.url()),
        ].filter((item): item is NavItem => Boolean(item));
    }

    return [
        adminNavItems.find((item) => item.href === '/admin/dashboard'),
        adminNavItems.find((item) => item.href === '/admin/routes'),
        adminNavItems.find((item) => item.href === '/admin/incidents'),
    ].filter((item): item is NavItem => Boolean(item));
}
