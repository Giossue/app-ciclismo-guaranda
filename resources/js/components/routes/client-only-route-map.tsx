import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { RouteMapProps } from './route-map';

export default function ClientOnlyRouteMap(props: RouteMapProps) {
    const [RouteMap, setRouteMap] =
        useState<ComponentType<RouteMapProps> | null>(null);

    useEffect(() => {
        let mounted = true;

        void import('./route-map').then(({ default: Component }) => {
            if (mounted) {
                setRouteMap(() => Component);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    if (RouteMap === null) {
        return (
            <Skeleton
                className="h-[420px] w-full md:h-[520px]"
                aria-label="Cargando mapa"
            />
        );
    }

    return <RouteMap {...props} />;
}
