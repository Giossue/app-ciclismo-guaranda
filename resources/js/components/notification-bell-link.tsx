import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PageProps = {
    notifications?: {
        unread_count?: number;
    };
};

type Props = {
    className?: string;
};

export function NotificationBellLink({ className }: Props) {
    const { notifications } = usePage<PageProps>().props;
    const unreadCount = notifications?.unread_count ?? 0;

    return (
        <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn('relative size-10 rounded-2xl', className)}
        >
            <Link
                href="/notifications"
                prefetch
                aria-label="Ver notificaciones"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full border border-background bg-primary px-1 text-[var(--fs-caption)] leading-5 font-black text-primary-foreground">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}
