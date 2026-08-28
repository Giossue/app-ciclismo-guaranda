import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    Bell,
    CheckCheck,
    MessageSquareText,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AppNotification = {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    read_at: string | null;
    created_at: string | null;
};

type PaginatedNotifications = {
    data: AppNotification[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    notifications: PaginatedNotifications;
    onlyUnread: boolean;
    unreadCount: number;
};

type NotificationGroup = {
    key: string;
    label: string;
    items: AppNotification[];
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

export default function NotificationsIndex({
    notifications,
    onlyUnread,
    unreadCount,
}: Props) {
    const groups = groupByDay(notifications.data);

    return (
        <>
            <Head title="Notificaciones" />

            <div className="flex flex-col gap-4">
                <section className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                        Avisos de incidencias, valoraciones y actividad de tu
                        cuenta.
                    </p>

                    <div className="flex w-max gap-2">
                        <FilterTab href="/notifications" active={!onlyUnread}>
                            Todas
                        </FilterTab>
                        <FilterTab
                            href="/notifications?unread=1"
                            active={onlyUnread}
                        >
                            No leídas
                        </FilterTab>
                    </div>

                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href="/notifications/read-all"
                                method="patch"
                                as="button"
                                preserveScroll
                            >
                                <CheckCheck data-icon="inline-start" />
                                Marcar todas como leídas
                            </Link>
                        </Button>
                    )}
                </section>

                {groups.map((group) => (
                    <section key={group.key} className="flex flex-col">
                        <div className="flex items-center gap-3 pb-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                {group.label}
                            </span>
                            <span
                                aria-hidden="true"
                                className="h-px flex-1 bg-border"
                            />
                        </div>

                        <ul className="flex flex-col">
                            {group.items.map((notification) => (
                                <NotificationRow
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))}
                        </ul>
                    </section>
                ))}

                {notifications.data.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <Bell className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-black text-foreground">
                            {onlyUnread
                                ? 'No tienes notificaciones sin leer'
                                : 'No tienes notificaciones'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Cuando exista actividad importante aparecerá aquí.
                        </p>
                    </div>
                )}

                {notifications.total > 0 && (
                    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            {notifications.from ?? 0}-{notifications.to ?? 0} de{' '}
                            {notifications.total} notificaciones.
                        </span>
                        <div className="flex gap-2">
                            {notifications.prev_page_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={notifications.prev_page_url}
                                        preserveScroll
                                    >
                                        Anterior
                                    </Link>
                                </Button>
                            )}
                            {notifications.next_page_url && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={notifications.next_page_url}
                                        preserveScroll
                                    >
                                        Siguiente
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function FilterTab({
    active,
    children,
    href,
}: {
    active: boolean;
    children: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            prefetch
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex min-h-10 touch-manipulation items-center justify-center rounded-xl px-3.5 text-sm font-bold whitespace-nowrap transition-[background,color,transform] active:scale-[0.98]',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            {children}
        </Link>
    );
}

function NotificationRow({ notification }: { notification: AppNotification }) {
    const Icon = notificationIcons[notification.type] ?? Bell;
    const typeLabel = notificationLabels[notification.type] ?? 'Aviso';

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
                        {formatTime(notification.created_at)}
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

    const rowClassName =
        'flex w-full items-start gap-3 rounded-[var(--radius-control)] px-2 py-3 text-left transition-colors';

    return (
        <li className="border-b border-border/60 last:border-b-0">
            {notification.read ? (
                <div className={rowClassName}>{body}</div>
            ) : (
                <Link
                    href={`/notifications/${notification.id}/read`}
                    method="patch"
                    as="button"
                    preserveScroll
                    aria-label={`Marcar como leída: ${notification.title}`}
                    className={cn(
                        rowClassName,
                        'touch-manipulation hover:bg-muted/60 active:scale-[0.995]',
                    )}
                >
                    {body}
                </Link>
            )}
        </li>
    );
}

function groupByDay(items: AppNotification[]): NotificationGroup[] {
    const groups: NotificationGroup[] = [];

    for (const item of items) {
        const key = item.created_at?.slice(0, 10) ?? 'sin-fecha';
        const current = groups.at(-1);

        if (current?.key === key) {
            current.items.push(item);

            continue;
        }

        groups.push({
            key,
            label: formatDayLabel(item.created_at),
            items: [item],
        });
    }

    return groups;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
}

function formatDayLabel(value: string | null): string {
    if (!value) {
        return 'Sin fecha';
    }

    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
        return 'Hoy';
    }

    if (isSameDay(date, yesterday)) {
        return 'Ayer';
    }

    const label = new Intl.DateTimeFormat('es-EC', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notificaciones',
            href: '/notifications',
        },
    ],
};
