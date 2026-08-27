import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex min-h-24 w-full resize-y rounded-[var(--radius-surface)] border border-input bg-input-surface px-4 py-3 text-base font-normal text-foreground shadow-none outline-none transition-[border-color,background-color,color] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm',
                'focus-visible:border-primary focus-visible:outline-none',
                'aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
