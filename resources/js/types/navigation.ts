import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    children?: NavItem[];
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** Clave de `adminCounters`: pinta el número de pendientes junto al módulo. */
    badgeKey?: 'incidents' | 'ratings' | 'poiSuggestions' | 'poiReports';
};
