import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className,
    id,
}: {
    message?: string;
    className?: string;
    id?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p
            id={id}
            className={cn('text-sm font-semibold text-destructive', className)}
        >
            {message}
        </p>
    );
}
