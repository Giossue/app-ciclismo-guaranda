import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex h-[var(--control-height)] w-full min-w-0 rounded-[var(--radius-surface)] border border-input bg-input-surface px-4 py-2 text-base font-normal text-foreground shadow-none transition-all outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-normal file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm',
                'focus-visible:border-primary focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--primary-glow)]',
                'aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15',
                className,
            )}
            {...props}
        />
    );
}

export { Input };
