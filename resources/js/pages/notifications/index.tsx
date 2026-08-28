import { Head, Link } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import type { AppNotification } from '@/components/notification-item';
import { NotificationItem } from '@/components/notification-item';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
                                <li
                                    key={notification.id}
                                    className="border-b border-border/60 last:border-b-0"
                                >
                                    <NotificationItem
                                        notification={notification}
                                        timeLabel="time"
                                    />
                                </li>
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

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notificaciones',
            href: '/notifications',
        },
    ],
};
