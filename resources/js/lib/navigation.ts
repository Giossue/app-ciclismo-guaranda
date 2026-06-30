import { Bot, Heart, Route } from 'lucide-react';
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
