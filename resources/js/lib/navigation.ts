import { Bell, Bot, Heart, Route } from 'lucide-react';
import { adminNavItems } from '@/lib/admin-navigation';
import type { Auth, NavItem } from '@/types';

const cyclistNavItems: NavItem[] = [
    {
        title: 'Rutas',
        href: '/routes',
        icon: Route,
    },
    {
        title: 'Favoritas',
        href: '/favorites',
        icon: Heart,
    },
    {
        title: 'Notificaciones',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Asistente IA',
        href: '/chat',
        icon: Bot,
    },
];

export function isAdmin(auth: Auth): boolean {
    return auth.user?.role?.name === 'administrador';
}

export function homePath(auth: Auth): string {
    return isAdmin(auth) ? '/admin/dashboard' : '/routes';
}

export function mainNavItems(auth: Auth): NavItem[] {
    return isAdmin(auth) ? adminNavItems : cyclistNavItems;
}

export function mobilePrimaryNavItems(auth: Auth): NavItem[] {
    if (!isAdmin(auth)) {
        return [
            cyclistNavItems.find((item) => item.href === '/routes'),
            cyclistNavItems.find((item) => item.href === '/notifications'),
            cyclistNavItems.find((item) => item.href === '/chat'),
        ].filter((item): item is NavItem => Boolean(item));
    }

    return [
        adminNavItems.find((item) => item.href === '/admin/dashboard'),
        adminNavItems.find((item) => item.href === '/admin/routes'),
        adminNavItems.find((item) => item.href === '/admin/incidents'),
    ].filter((item): item is NavItem => Boolean(item));
}

export function mobileMoreNavItems(auth: Auth): NavItem[] {
    const primaryHrefs = new Set(
        mobilePrimaryNavItems(auth).map((item) => item.href),
    );

    return mainNavItems(auth).filter((item) => !primaryHrefs.has(item.href));
}
