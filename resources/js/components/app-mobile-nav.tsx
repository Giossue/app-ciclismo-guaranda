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
        <nav className="fixed inset-x-3 bottom-3 z-[70] md:hidden">
            <div className="grid grid-cols-4 gap-1 rounded-3xl border bg-background/95 p-2 shadow-2xl shadow-black/20 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                {primaryItems.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            className={cn(
                                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
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
                    className={cn(
                        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition-colors',
                        isCurrentUrl('/menu')
                            ? 'bg-primary text-primary-foreground'
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
        return 'IA';
    }

    if (title === 'Incidencias') {
        return 'Alertas';
    }

    return title;
}
