import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Bell,
    MessageSquareText,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppNotification = {
    id: number;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    read: boolean;
    created_at: string | null;
};

const notificationIcons: Record<string, LucideIcon> = {
    incident_reported: AlertTriangle,
    incident_reviewed: ShieldCheck,
    rating_reviewed: MessageSquareText,
};

const notificationLabels: Record<string, string> = {
    incident_reported: 'Incidencia',
    incident_reviewed: 'Incidencia revisada',
    rating_reviewed: 'Valoración',
};

/**
 * Fila de notificación. Si está sin leer, la fila entera es la acción: marca
 * como leída y, cuando el aviso tiene destino, lleva hasta él.
 */
export function NotificationItem({
    notification,
    onNavigate,
    timeLabel,
    markAsReadHref,
}: {
    notification: AppNotification;
    onNavigate?: () => void;
    /** 'time' muestra la hora; 'relative' muestra «hace un momento». */
    timeLabel?: 'time' | 'relative';
    markAsReadHref: string;
}) {
    const Icon = notificationIcons[notification.type] ?? Bell;
    const typeLabel = notificationLabels[notification.type] ?? 'Aviso';
    const stamp =
        timeLabel === 'time'
            ? formatTime(notification.created_at)
            : formatRelative(notification.created_at);

    const body = (
        <>
            <span
                className={cn(
                    'mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl',
                    notification.read
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/12 text-link',
                )}
            >
                <Icon className="size-4" />
                <span className="sr-only">{typeLabel}</span>
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline justify-between gap-3">
                    <span
                        className={cn(
                            'min-w-0 text-sm font-bold',
                            notification.read
                                ? 'text-foreground/90'
                                : 'text-foreground',
                        )}
                    >
                        {notification.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {stamp}
                    </span>
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                    {notification.message}
                </span>
            </span>

            <span
                aria-hidden="true"
                className={cn(
                    'mt-2 size-2 shrink-0 rounded-full',
                    notification.read ? 'bg-transparent' : 'bg-primary',
                )}
            />
        </>
    );

    const className =
        'flex w-full items-start gap-3 rounded-[var(--radius-control)] px-2 py-3 text-left transition-colors';

    if (notification.read && !notification.link) {
        return <div className={className}>{body}</div>;
    }

    return (
        <Link
            href={notification.link ?? markAsReadHref}
            method={notification.link ? 'get' : 'patch'}
            as={notification.link ? 'a' : 'button'}
            preserveScroll={!notification.link}
            onClick={onNavigate}
            aria-label={
                notification.link
                    ? notification.title
                    : `Marcar como leída: ${notification.title}`
            }
            className={cn(
                className,
                'touch-manipulation hover:bg-muted/60 active:scale-[0.995]',
            )}
        >
            {body}
        </Link>
    );
}

export function formatTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

/** «hace un momento», «hace 3 h», «hace 2 días». */
export function formatRelative(value: string | null): string {
    if (!value) {
        return '';
    }

    const elapsed = (Date.now() - new Date(value).getTime()) / 1000;
    const formatter = new Intl.RelativeTimeFormat('es-EC', {
        numeric: 'auto',
        style: 'short',
    });

    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, seconds] of units) {
        if (elapsed >= seconds) {
            return formatter.format(-Math.floor(elapsed / seconds), unit);
        }
    }

    return 'hace un momento';
}
