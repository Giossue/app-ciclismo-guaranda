import { NotificationsIndex } from '@/pages/notifications';
import type {
    NotificationRoutes,
    NotificationsIndexProps,
} from '@/pages/notifications';
import {
    index as notificationsIndex,
    read as notificationsRead,
    readAll as notificationsReadAll,
} from '@/routes/admin/notifications';

const adminNotificationRoutes: NotificationRoutes = {
    all: notificationsIndex.url(),
    unread: notificationsIndex.url({ query: { unread: 1 } }),
    markAllAsRead: notificationsReadAll.url(),
    markAsRead: (notificationId) => notificationsRead.url(notificationId),
};

export default function AdminNotificationsIndex(
    props: NotificationsIndexProps,
) {
    return (
        <NotificationsIndex
            {...props}
            notificationRoutes={adminNotificationRoutes}
        />
    );
}

AdminNotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notificaciones',
            href: notificationsIndex.url(),
        },
    ],
};
