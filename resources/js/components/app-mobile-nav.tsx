import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, Settings } from 'lucide-react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { mobileMoreNavItems, mobilePrimaryNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { Auth, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppMobileNav() {
    const { auth } = usePage<PageProps>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const primaryItems = mobilePrimaryNavItems(auth);
    const moreItems = mobileMoreNavItems(auth);

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

                <Sheet>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <Menu className="size-5" />
                            Más
                        </button>
                    </SheetTrigger>
                    <SheetContent
                        side="bottom"
                        className="max-h-[92svh] rounded-t-[2rem] border-primary/10 bg-background p-0"
                    >
                        <SheetHeader className="border-b px-5 py-4 text-left">
                            <SheetTitle className="text-xl">Módulos</SheetTitle>
                        </SheetHeader>

                        <div className="overflow-y-auto px-5 pt-5 pb-8">
                            <div className="mb-5 rounded-[1.75rem] border bg-card/80 p-4">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Sesión activa
                                </p>
                                <p className="mt-1 text-base font-semibold">
                                    {auth.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {auth.user.email}
                                </p>
                            </div>

                            {moreItems.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {moreItems.map((item, index) => (
                                        <MobileMenuCard
                                            key={item.title}
                                            item={item}
                                            active={isCurrentUrl(item.href)}
                                            featured={index === 0}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <SheetClose asChild>
                                    <Link
                                        href={edit()}
                                        prefetch
                                        className="group flex min-h-32 flex-col justify-between rounded-[1.75rem] border bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
                                    >
                                        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                                            <Settings className="size-6" />
                                        </span>
                                        <span>
                                            <span className="block text-base font-semibold">
                                                Perfil
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Cuenta y seguridad
                                            </span>
                                        </span>
                                    </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                        className="group flex min-h-32 flex-col justify-between rounded-[1.75rem] border bg-card p-4 text-left text-destructive shadow-sm transition-transform active:scale-[0.98]"
                                    >
                                        <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
                                            <LogOut className="size-6" />
                                        </span>
                                        <span>
                                            <span className="block text-base font-semibold">
                                                Salir
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Cerrar sesión
                                            </span>
                                        </span>
                                    </Link>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}

function MobileMenuCard({
    item,
    active,
    featured,
}: {
    item: NavItem;
    active: boolean;
    featured: boolean;
}) {
    const Icon = item.icon;

    return (
        <SheetClose asChild>
            <Link
                href={item.href}
                prefetch
                className={cn(
                    'group flex min-h-32 flex-col justify-between rounded-[1.75rem] border bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]',
                    'hover:border-primary/40 hover:bg-primary/5',
                    (active || featured) &&
                        'border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20',
                )}
            >
                <span
                    className={cn(
                        'flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground transition-colors',
                        (active || featured) &&
                            'bg-primary-foreground/20 text-primary-foreground',
                    )}
                >
                    {Icon && <Icon className="size-6" />}
                </span>
                <span>
                    <span className="block text-base leading-tight font-semibold">
                        {item.title}
                    </span>
                    <span
                        className={cn(
                            'text-xs text-muted-foreground',
                            (active || featured) &&
                                'text-primary-foreground/75',
                        )}
                    >
                        Abrir módulo
                    </span>
                </span>
            </Link>
        </SheetClose>
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
