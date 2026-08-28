import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { mobilePrimaryNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    notifications?: {
        unread_count?: number;
    };
};

export function AppMobileNav() {
    const { auth, notifications } = usePage<PageProps>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const { openMobile, setOpenMobile } = useSidebar();
    const primaryItems = mobilePrimaryNavItems(auth);
    const unreadCount = notifications?.unread_count ?? 0;

    if (!auth.user) {
        return null;
    }

    return (
        <nav className="fixed inset-x-0 bottom-0 z-[70] h-[calc(var(--bottom-nav-height)+var(--safe-bottom))] border-t border-input bg-card px-2 pb-[var(--safe-bottom)] shadow-[0_-4px_15px_var(--shadow)] md:hidden">
            <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-md items-center justify-around gap-1">
                {primaryItems.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[calc(var(--fs-caption)*1.2)] leading-none font-bold transition-[color,transform] active:scale-[0.96]',
                                active
                                    ? 'text-link'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <span className="relative">
                                {Icon && (
                                    <Icon
                                        className={cn(
                                            'size-[1.2rem] transition-transform duration-200 ease-out',
                                            active && 'scale-110',
                                        )}
                                    />
                                )}
                                {item.href === '/notifications' &&
                                    unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-primary px-1 leading-4 font-black text-[var(--fs-caption)] text-primary-foreground">
                                            {unreadCount > 9
                                                ? '9+'
                                                : unreadCount}
                                        </span>
                                    )}
                            </span>
                            <span className="max-w-full truncate">
                                {shortTitle(item.title)}
                            </span>
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={() => setOpenMobile(true)}
                    aria-expanded={openMobile}
                    aria-label="Abrir menú de navegación"
                    className={cn(
                        'flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[calc(var(--fs-caption)*1.2)] leading-none font-bold transition-[color,transform] active:scale-[0.96]',
                        openMobile
                            ? 'text-link'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Menu className="size-[1.2rem]" />
                    Más
                </button>
            </div>
        </nav>
    );
}

function shortTitle(title: string): string {
    if (title === 'Asistente IA') {
        return 'IA Guía';
    }

    if (title === 'Incidencias') {
        return 'Alertas';
    }

    return title;
}
