import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LocationPickerMapProps } from './location-picker-map';

export default function ClientOnlyLocationPickerMap(
    props: LocationPickerMapProps,
) {
    const [LocationPickerMap, setLocationPickerMap] =
        useState<ComponentType<LocationPickerMapProps> | null>(null);

    useEffect(() => {
        let mounted = true;

        void import('./location-picker-map').then(({ default: Component }) => {
            if (mounted) {
                setLocationPickerMap(() => Component);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    if (LocationPickerMap === null) {
        return (
            <Skeleton
                className={cn('w-full', props.className)}
                aria-label="Cargando selector de ubicación"
            />
        );
    }

    return <LocationPickerMap {...props} />;
}
