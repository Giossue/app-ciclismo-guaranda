import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Capitaliza la inicial. Los catálogos se guardan en minúscula («activa»,
 * «en revisión») y se muestran así en toda la interfaz, sin tocar el dato.
 */
export function capitalize(value: string): string {
    if (value === '') {
        return value;
    }

    return `${value.charAt(0).toLocaleUpperCase('es-EC')}${value.slice(1)}`;
}
