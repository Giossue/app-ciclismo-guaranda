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
            <div className="grid grid-cols-4 gap-1 rounded-[1.8rem] border border-primary/10 bg-card/95 p-1.5 shadow-2xl shadow-primary/15 backdrop-blur supports-[backdrop-filter]:bg-card/85">
                {primaryItems.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            className={cn(
                                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-bold transition-[color,background-color,transform] active:scale-[0.98]',
                                active
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
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
                        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-bold transition-[color,background-color,transform] active:scale-[0.98]',
                        isCurrentUrl('/menu')
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
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
