import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

function FieldGroup({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-group"
            className={cn('flex w-full flex-col gap-5', className)}
            {...props}
        />
    );
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field"
            className={cn(
                'flex w-full flex-col gap-2 data-[invalid=true]:text-destructive',
                className,
            )}
            {...props}
        />
    );
}

function FieldLabel({
    className,
    ...props
}: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn('font-medium', className)}
            {...props}
        />
    );
}

function FieldDescription({
    className,
    ...props
}: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn(
                'text-sm leading-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
                className,
            )}
            {...props}
        />
    );
}

export { Field, FieldDescription, FieldGroup, FieldLabel };
