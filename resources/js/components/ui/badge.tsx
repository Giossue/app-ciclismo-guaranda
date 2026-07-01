import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-xl border px-2.5 py-1 text-[var(--fs-xs)] leading-none font-black tracking-[0.05em] whitespace-nowrap uppercase transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'border-primary bg-primary text-primary-foreground',
                secondary: 'border-primary bg-primary text-primary-foreground',
                destructive: 'border-destructive bg-destructive text-destructive-foreground',
                outline: 'border-input bg-input text-muted-foreground',
                success: 'border-success bg-success text-success-foreground',
                warning: 'border-warning bg-warning text-warning-foreground',
                info: 'border-info bg-info text-info-foreground',
                muted: 'border-input bg-input text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
