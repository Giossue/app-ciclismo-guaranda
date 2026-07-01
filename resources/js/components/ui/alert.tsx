import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
    'relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-2xl border px-4 py-3.5 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4.5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'border-border/80 bg-card/95 text-foreground shadow-sm',
                destructive:
                    'border-destructive/20 bg-destructive text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/90',
                warning:
                    'border-warning/25 bg-warning/12 text-foreground [&>svg]:text-warning *:data-[slot=alert-description]:text-muted-foreground',
                success:
                    'border-success/25 bg-success/12 text-foreground [&>svg]:text-success *:data-[slot=alert-description]:text-muted-foreground',
                info: 'border-info/25 bg-info/12 text-foreground [&>svg]:text-info *:data-[slot=alert-description]:text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Alert({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn('col-start-2 min-h-4 font-bold tracking-tight', className)}
            {...props}
        />
    );
}

function AlertDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'col-start-2 grid justify-items-start gap-1 text-sm leading-relaxed text-muted-foreground [&_p]:leading-relaxed',
                className,
            )}
            {...props}
        />
    );
}

export { Alert, AlertTitle, AlertDescription };
