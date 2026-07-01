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
        <nav className="fixed inset-x-0 bottom-0 z-[70] border-t bg-card/92 px-2 pt-2 pb-[calc(var(--safe-bottom)+0.45rem)] shadow-[0_-12px_40px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5">
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
                                'flex min-h-[3.35rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10.5px] leading-none font-black transition-[background,color,transform] active:scale-[0.97]',
                                active
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            {Icon && <Icon className="size-5" />}
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
                        'flex min-h-[3.35rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10.5px] leading-none font-black transition-[background,color,transform] active:scale-[0.97]',
                        isCurrentUrl('/menu')
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
