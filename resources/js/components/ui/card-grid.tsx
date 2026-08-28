import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Rejilla de tarjetas mobile first. Arranca en dos columnas porque las
 * métricas y los resúmenes de ruta caben de a dos en un teléfono.
 *
 * Resuelve además dos huecos que la rejilla normal deja:
 * - si el último elemento queda solo en su fila, ocupa el ancho completo en
 *   vez de dejar media fila vacía;
 * - si hay menos elementos que columnas, la rejilla baja su número de
 *   columnas en lugar de dejar celdas sueltas al final.
 */
const gridLayouts = {
    '2': '[&>*:last-child:nth-child(odd)]:col-span-2',
    'md-3':
        'md:grid-cols-3 max-md:[&>*:last-child:nth-child(odd)]:col-span-2 md:has-[>*:nth-child(1):last-child]:grid-cols-1 md:has-[>*:nth-child(2):last-child]:grid-cols-2',
    'lg-3':
        'lg:grid-cols-3 max-lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:has-[>*:nth-child(1):last-child]:grid-cols-1 lg:has-[>*:nth-child(2):last-child]:grid-cols-2',
    'lg-4':
        'lg:grid-cols-4 max-lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:has-[>*:nth-child(1):last-child]:grid-cols-1 lg:has-[>*:nth-child(2):last-child]:grid-cols-2 lg:has-[>*:nth-child(3):last-child]:grid-cols-3',
} as const;

type CardGridProps = React.ComponentProps<'div'> & {
    as?: 'div' | 'section';
    layout?: keyof typeof gridLayouts;
};

function CardGrid({
    as: Component = 'div',
    className,
    layout = 'lg-4',
    ...props
}: CardGridProps) {
    return (
        <Component
            data-slot="card-grid"
            className={cn(
                'grid grid-cols-2 gap-3',
                gridLayouts[layout],
                className,
            )}
            {...props}
        />
    );
}

export { CardGrid };
export type { CardGridProps };
