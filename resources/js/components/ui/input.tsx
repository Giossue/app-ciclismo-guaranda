import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex h-[52px] w-full min-w-0 rounded-2xl border border-input bg-input px-4 py-2 text-base font-semibold text-foreground shadow-none transition-all outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm',
                'focus-visible:border-primary focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--glow-color)]',
                'aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_4px_rgb(255_107_107_/_0.15)]',
                className,
            )}
            {...props}
        />
    );
}

export { Input };
