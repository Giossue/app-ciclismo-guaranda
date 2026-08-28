import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[var(--fs-xs)] leading-none font-semibold tracking-[0.04em] uppercase whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-4',
    {
        variants: {
            variant: {
                // Sólido: estado vigente o dato que exige atención.
                default: 'border-primary bg-primary text-primary-foreground',
                // Neutro: metadato, taxonomía, contador informativo o estado apagado.
                outline: 'border-input bg-input text-muted-foreground',
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
