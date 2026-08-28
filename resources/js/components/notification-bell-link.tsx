import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import type { AppNotification } from '@/components/notification-item';
import { NotificationItem } from '@/components/notification-item';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { isAdmin } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
    index as adminNotificationsIndex,
    read as adminNotificationsRead,
    readAll as adminNotificationsReadAll,
} from '@/routes/admin/notifications';
import {
    index as notificationsIndex,
    read as notificationsRead,
    readAll as notificationsReadAll,
} from '@/routes/notifications';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    notificationCenter?: {
        unread_count?: number;
        latest?: AppNotification[];
    };
};

type Props = {
    className?: string;
};

/**
 * Campana del encabezado: abre un panel con los últimos avisos en vez de
 * llevarte a otra pantalla. La lista es un prop opcional, así que solo se pide
 * al abrir el panel.
 */
export function NotificationBellLink({ className }: Props) {
    const { auth, notificationCenter } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const unreadCount = notificationCenter?.unread_count ?? 0;
    const latest = notificationCenter?.latest;
    const notificationRoutes = isAdmin(auth)
        ? {
              all: adminNotificationsIndex.url(),
              markAllAsRead: adminNotificationsReadAll.url(),
              markAsRead: (notificationId: number) =>
                  adminNotificationsRead.url(notificationId),
          }
        : {
              all: notificationsIndex.url(),
              markAllAsRead: notificationsReadAll.url(),
              markAsRead: (notificationId: number) =>
                  notificationsRead.url(notificationId),
          };

    const openPanel = () => {
        setOpen(true);
        setLoading(true);

        router.reload({
            only: ['notificationCenter'],
            onFinish: () => setLoading(false),
        });
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openPanel}
                aria-label={
                    unreadCount > 0
                        ? `Notificaciones, ${unreadCount} sin leer`
                        : 'Notificaciones'
                }
                className={cn('relative', className)}
            >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-1.5 size-2 rounded-full border border-background bg-destructive"
                    />
                )}
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Notificaciones</SheetTitle>
                        <SheetDescription>
                            {unreadCount > 0
                                ? `Tienes ${unreadCount} sin leer.`
                                : 'Estás al día.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5">
                        {loading && latest === undefined ? (
                            <div className="flex flex-col gap-3 py-2">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <Skeleton
                                        key={`notification-skeleton-${index}`}
                                        className="h-16 w-full"
                                    />
                                ))}
                            </div>
                        ) : latest && latest.length > 0 ? (
                            <ul className="ueb-stagger flex flex-col">
                                {latest.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className="border-b border-border/60 last:border-b-0"
                                    >
                                        <NotificationItem
                                            notification={notification}
                                            timeLabel="relative"
                                            onNavigate={() => setOpen(false)}
                                            markAsReadHref={notificationRoutes.markAsRead(
                                                notification.id,
                                            )}
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                Cuando exista actividad importante aparecerá
                                aquí.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 border-t px-5 py-4">
                        {unreadCount > 0 && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={notificationRoutes.markAllAsRead}
                                    method="patch"
                                    as="button"
                                    preserveScroll
                                >
                                    <CheckCheck data-icon="inline-start" />
                                    Marcar todas como leídas
                                </Link>
                            </Button>
                        )}
                        <Button size="sm" asChild>
                            <Link
                                href={notificationRoutes.all}
                                prefetch
                                onClick={() => setOpen(false)}
                            >
                                Ver todas
                            </Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
