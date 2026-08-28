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
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import PoiReportController from '@/actions/App/Http/Controllers/Admin/PoiReportController';
import PoiSuggestionController from '@/actions/App/Http/Controllers/Admin/PoiSuggestionController';
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
        href: PoiController.index(),
        icon: MapPin,
        children: [
            {
                title: 'POIs',
                href: PoiController.index(),
            },
            {
                title: 'Sugerencias',
                href: PoiSuggestionController(),
                badgeKey: 'poiSuggestions',
            },
            {
                title: 'Reportes',
                href: PoiReportController(),
                badgeKey: 'poiReports',
            },
        ],
    },
    {
        title: 'Incidencias',
        href: '/admin/incidents',
        icon: ClipboardList,
        badgeKey: 'incidents',
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
        badgeKey: 'ratings',
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
