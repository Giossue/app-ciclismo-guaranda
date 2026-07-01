import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-black transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    'border border-primary bg-primary text-primary-foreground shadow-[0_8px_18px_var(--shadow-color)] hover:bg-[var(--primary-hover)]',
                destructive:
                    'border border-destructive bg-destructive text-destructive-foreground hover:brightness-95',
                outline:
                    'border border-input bg-input text-foreground hover:border-primary hover:text-primary',
                secondary:
                    'border border-primary bg-primary text-primary-foreground shadow-[0_8px_18px_var(--shadow-color)] hover:bg-[var(--primary-hover)]',
                ghost: 'border border-transparent bg-transparent text-muted-foreground hover:bg-input hover:text-foreground',
                link: 'h-auto min-h-0 rounded-none border-0 bg-transparent px-0 py-0 text-primary underline-offset-4 hover:underline active:scale-100',
                warning:
                    'border border-warning bg-warning text-warning-foreground hover:brightness-95',
                success:
                    'border border-success bg-success text-success-foreground hover:brightness-95',
            },
            size: {
                default: 'h-11 px-5 py-2 has-[>svg]:px-4',
                sm: 'h-10 px-4 text-xs has-[>svg]:px-3',
                lg: 'h-12 px-7 text-base has-[>svg]:px-5',
                icon: 'size-11 min-h-11 rounded-full',
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
