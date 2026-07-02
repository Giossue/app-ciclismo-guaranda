import { Head, Link } from '@inertiajs/react';
import { Bell, CheckCheck, Circle, MailOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

export default function NotificationsIndex({
    notifications,
    onlyUnread,
    unreadCount,
}: Props) {
    return (
        <>
            <Head title="Notificaciones" />

            <div className="flex flex-col gap-4">
                <section className="p-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Avisos de incidencias, valoraciones y actividad de
                            tu cuenta.
                        </p>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-3">
                        <div className="flex w-max gap-2">
                            <Link
                                href="/notifications"
                                prefetch
                                className={cn(
                                    'flex min-h-10 touch-manipulation items-center justify-center rounded-xl px-3.5 text-sm font-bold whitespace-nowrap transition-[background,color,transform] active:scale-[0.98]',
                                    !onlyUnread
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-[var(--tab-inactive-text)] hover:text-foreground',
                                )}
                            >
                                Todas
                            </Link>
                            <Link
                                href="/notifications?unread=1"
                                prefetch
                                className={cn(
                                    'flex min-h-10 touch-manipulation items-center justify-center rounded-xl px-3.5 text-sm font-bold whitespace-nowrap transition-[background,color,transform] active:scale-[0.98]',
                                    onlyUnread
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-[var(--tab-inactive-text)] hover:text-foreground',
                                )}
                            >
                                No leídas
                            </Link>
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
                    </div>
                </section>

                <section className="grid gap-3">
                    {notifications.data.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                        />
                    ))}
                </section>

                {notifications.data.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
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

function NotificationCard({ notification }: { notification: AppNotification }) {
    return (
        <Card
            className={cn(
                'transition-colors',
                !notification.read && 'border-primary/50 bg-primary/5',
            )}
        >
            <CardHeader className="gap-3">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-2xl border',
                            notification.read
                                ? 'bg-muted/30 text-muted-foreground'
                                : 'border-primary bg-primary text-primary-foreground',
                        )}
                    >
                        {notification.read ? (
                            <MailOpen className="size-5" />
                        ) : (
                            <Bell className="size-5" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {!notification.read && (
                                <Badge>
                                    <Circle data-icon="inline-start" />
                                    nueva
                                </Badge>
                            )}
                            <Badge variant="outline">
                                {notificationTypeLabel(notification.type)}
                            </Badge>
                        </div>
                        <CardTitle>{notification.title}</CardTitle>
                        <CardDescription className="mt-1">
                            {formatDate(notification.created_at)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {notification.message}
                </p>
            </CardContent>
            {!notification.read && (
                <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                        <Link
                            href={`/notifications/${notification.id}/read`}
                            method="patch"
                            as="button"
                            preserveScroll
                        >
                            <MailOpen data-icon="inline-start" />
                            Marcar como leída
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

function notificationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        incident_reported: 'Incidencia',
        incident_reviewed: 'Incidencia revisada',
        rating_reviewed: 'Valoración',
    };

    return labels[type] ?? 'Aviso';
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Fecha no disponible';
    }

    return new Date(value).toLocaleString('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notificaciones',
            href: '/notifications',
        },
    ],
};
