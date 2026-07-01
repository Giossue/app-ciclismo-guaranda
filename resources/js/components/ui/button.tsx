import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-[-0.01em] transition-[background,color,box-shadow,transform,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    'border border-primary/10 bg-primary text-primary-foreground shadow-[0_10px_26px_color-mix(in_oklch,var(--primary)_24%,transparent)] hover:bg-primary/92',
                destructive:
                    'border border-destructive/10 bg-destructive text-destructive-foreground shadow-[0_10px_26px_color-mix(in_oklch,var(--destructive)_22%,transparent)] hover:bg-destructive/92 focus-visible:ring-destructive/25',
                outline:
                    'border border-input bg-card/95 text-foreground shadow-sm hover:border-primary/35 hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'border border-secondary/10 bg-secondary text-secondary-foreground shadow-[0_10px_24px_color-mix(in_oklch,var(--secondary)_18%,transparent)] hover:bg-secondary/90',
                ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
                link: 'h-auto min-h-0 rounded-xl px-0 py-0 text-primary underline-offset-4 hover:underline active:scale-100',
                warning:
                    'border border-warning/10 bg-warning text-warning-foreground shadow-[0_10px_24px_color-mix(in_oklch,var(--warning)_22%,transparent)] hover:bg-warning/90',
                success:
                    'border border-success/10 bg-success text-success-foreground shadow-[0_10px_24px_color-mix(in_oklch,var(--success)_18%,transparent)] hover:bg-success/90',
            },
            size: {
                default: 'h-11 px-5 py-2 has-[>svg]:px-4',
                sm: 'h-10 px-4 text-xs has-[>svg]:px-3',
                lg: 'h-12 px-7 text-base has-[>svg]:px-5',
                icon: 'size-11 min-h-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
