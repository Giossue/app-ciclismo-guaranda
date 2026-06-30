import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { mobileMoreNavItems, mobilePrimaryNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AppMobileNav() {
    const { auth } = usePage<PageProps>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const getInitials = useInitials();
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
                        <Button
                            variant="ghost"
                            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Menu className="size-5" />
                            Más
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="bottom"
                        className="max-h-[85svh] rounded-t-3xl p-0"
                    >
                        <SheetHeader className="border-b text-left">
                            <SheetTitle>Menú</SheetTitle>
                        </SheetHeader>

                        <div className="grid gap-4 overflow-y-auto p-4 pb-8">
                            <div className="rounded-2xl border bg-card p-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-muted text-foreground">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <UserInfo user={auth.user} showEmail />
                                </div>
                            </div>

                            {moreItems.length > 0 && (
                                <div className="grid gap-2">
                                    <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Módulos
                                    </p>
                                    <div className="grid gap-2">
                                        {moreItems.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <SheetClose
                                                    key={item.title}
                                                    asChild
                                                >
                                                    <Link
                                                        href={item.href}
                                                        prefetch
                                                        className="flex min-h-12 items-center gap-3 rounded-2xl border bg-card px-3 text-sm font-medium hover:bg-accent"
                                                    >
                                                        {Icon && (
                                                            <Icon className="size-5" />
                                                        )}
                                                        {item.title}
                                                    </Link>
                                                </SheetClose>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Cuenta
                                </p>
                                <SheetClose asChild>
                                    <Link
                                        href={edit()}
                                        prefetch
                                        className="flex min-h-12 items-center gap-3 rounded-2xl border bg-card px-3 text-sm font-medium hover:bg-accent"
                                    >
                                        <Settings className="size-5" />
                                        Perfil y seguridad
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                        className="flex min-h-12 w-full items-center gap-3 rounded-2xl border bg-card px-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                                    >
                                        <LogOut className="size-5" />
                                        Cerrar sesión
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

function shortTitle(title: string): string {
    if (title === 'Asistente IA') {
        return 'IA';
    }

    if (title === 'Incidencias') {
        return 'Alertas';
    }

    return title;
}
