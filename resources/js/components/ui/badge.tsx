import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    // Todo el badge se escala con --badge-scale sobre la métrica base del
    // sistema, así separación, relleno, tipografía e icono se mueven juntos.
    'inline-flex w-fit shrink-0 items-center justify-center gap-[calc(0.25rem*var(--badge-scale))] rounded-full border px-[calc(0.625rem*var(--badge-scale))] py-[calc(0.25rem*var(--badge-scale))] text-[calc(var(--fs-xs)*var(--badge-scale))] leading-none font-semibold tracking-[0.04em] uppercase whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-[calc(1rem*var(--badge-scale))]',
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
