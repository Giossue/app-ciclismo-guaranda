import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * La densidad de la card sale de un solo token local, `--card-spacing`:
 * relleno vertical, relleno horizontal y separación entre bloques se
 * calculan desde él. Para comprimir o airear una card se cambia ese número,
 * no seis clases sueltas. `size="sm"` baja la escala completa de golpe.
 */
function Card({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
    return (
        <div
            data-slot="card"
            data-size={size}
            className={cn(
                'group/card flex flex-col gap-(--card-spacing) rounded-[var(--radius-surface)] border border-input bg-card py-(--card-spacing) text-card-foreground shadow-[0_2px_8px_var(--shadow)]',
                '[--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(6)]',
                size === 'sm' &&
                    '[--card-spacing:--spacing(3)] sm:[--card-spacing:--spacing(4)]',
                className,
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                'flex flex-col gap-1.5 px-(--card-spacing)',
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn(
                'text-[var(--fs-lg)] leading-[var(--lh-title)] font-bold tracking-[-0.04em] text-foreground',
                'group-data-[size=sm]/card:text-[var(--fs-md)]',
                className,
            )}
            {...props}
        />
    );
}

function CardDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn(
                'text-[var(--fs-sm)] leading-[var(--lh-body)] text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-content"
            className={cn('px-(--card-spacing)', className)}
            {...props}
        />
    );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn(
                'flex items-center gap-2 px-(--card-spacing)',
                className,
            )}
            {...props}
        />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
