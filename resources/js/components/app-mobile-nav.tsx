import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { mobilePrimaryNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppMobileNav() {
    const { auth } = usePage<PageProps>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const primaryItems = mobilePrimaryNavItems(auth);

    if (!auth.user) {
        return null;
    }

    return (
        <nav className="fixed inset-x-0 bottom-0 z-[70] h-[calc(var(--bottom-nav-height)+var(--safe-bottom))] border-t border-input bg-card px-2 pb-[var(--safe-bottom)] shadow-[0_-4px_15px_var(--shadow-color)] md:hidden">
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
                                'flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 leading-none font-bold text-[var(--fs-xs)] transition-[color,transform] active:scale-[0.96]',
                                active
                                    ? 'text-primary'
                                    : 'text-[var(--text-muted)] hover:text-foreground',
                            )}
                        >
                            {Icon && (
                                <Icon className="size-5 transition-transform" />
                            )}
                            <span className="max-w-full truncate">
                                {shortTitle(item.title)}
                            </span>
                        </Link>
                    );
                })}

                <Link
                    href="/menu"
                    prefetch
                    aria-current={isCurrentUrl('/menu') ? 'page' : undefined}
                    className={cn(
                        'flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 leading-none font-bold text-[var(--fs-xs)] transition-[color,transform] active:scale-[0.96]',
                        isCurrentUrl('/menu')
                            ? 'text-primary'
                            : 'text-[var(--text-muted)] hover:text-foreground',
                    )}
                >
                    <Menu className="size-5" />
                    Más
                </Link>
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
