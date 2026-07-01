import {
    BarChart3,
    Bell,
    Bike,
    ClipboardList,
    LayoutDashboard,
    MapPin,
    MessageSquareText,
    Route,
    Settings,
    Tags,
    Users,
} from 'lucide-react';
import type { NavItem } from '@/types';

export const adminNavItems: NavItem[] = [
    {
        title: 'Resumen',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Notificaciones',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Rutas',
        href: '/admin/routes',
        icon: Route,
    },
    {
        title: 'POIs',
        href: '/admin/pois',
        icon: MapPin,
    },
    {
        title: 'Incidencias',
        href: '/admin/incidents',
        icon: ClipboardList,
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Valoraciones',
        href: '/admin/ratings',
        icon: MessageSquareText,
    },
    {
        title: 'Catálogos',
        href: '/admin/catalogs',
        icon: Tags,
    },
    {
        title: 'Estadísticas',
        href: '/admin/statistics',
        icon: BarChart3,
    },
    {
        title: 'Configuración',
        href: '/admin/settings',
        icon: Settings,
    },
];

export const adminQuickActions: NavItem[] = [
    {
        title: 'Preparar nueva ruta',
        href: '/admin/routes',
        icon: Bike,
    },
    {
        title: 'Revisar incidencias',
        href: '/admin/incidents',
        icon: ClipboardList,
    },
    {
        title: 'Gestionar usuarios',
        href: '/admin/users',
        icon: Users,
    },
];
