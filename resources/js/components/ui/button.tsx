import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-surface)] text-sm font-black outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 enabled:active:scale-[0.98] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    'border border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover',
                destructive:
                    'border border-destructive bg-destructive text-destructive-foreground hover:brightness-95',
                outline:
                    'border border-input bg-transparent text-foreground hover:border-primary hover:bg-muted hover:text-foreground',
                secondary:
                    'border border-border bg-secondary text-secondary-foreground hover:border-primary hover:bg-muted hover:text-foreground',
                ghost: 'border border-transparent bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                link: 'h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-link underline-offset-4 hover:text-link-hover hover:underline active:scale-100',
                inverse:
                    'border border-inverse-foreground/35 bg-transparent text-inverse-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground',
                overlay:
                    'border border-border/60 bg-background/85 text-foreground backdrop-blur-sm hover:border-primary hover:bg-background',
                'destructive-ghost':
                    'border border-transparent bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive',
                warning:
                    'border border-warning bg-warning text-warning-foreground hover:brightness-95',
                success:
                    'border border-success bg-success text-success-foreground hover:brightness-95',
            },
            size: {
                default: 'h-[var(--action-height)] px-5 py-2 has-[>svg]:px-4',
                sm: 'h-[var(--action-height-sm)] px-4 text-xs has-[>svg]:px-3',
                lg: 'h-[var(--action-height-lg)] px-7 text-base has-[>svg]:px-5',
                icon: 'size-[var(--action-height)] min-h-[var(--action-height)] rounded-full',
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
    variant = 'default',
    size = 'default',
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
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
