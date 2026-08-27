import { Link, router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import type { Auth, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
};

type AccountItem = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
};

const accountItems: AccountItem[] = [
    {
        title: 'Perfil',
        description: 'Datos de tu cuenta',
        href: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Seguridad',
        description: 'Contraseña y acceso',
        href: '/settings/security',
        icon: ShieldCheck,
    },
    {
        title: 'Apariencia',
        description: 'Tema de la app',
        href: '/settings/appearance',
        icon: Palette,
    },
];

/**
 * Cuerpo del sidebar en móvil: misma navegación que el sidebar de escritorio,
 * presentada con el estilo de tarjetas del antiguo `/menu`.
 */
export function AppSidebarMenu({ items }: { items: NavItem[] }) {
    const { auth } = usePage<PageProps>().props;
    const { setOpenMobile } = useSidebar();
    const cleanup = useMobileNavigation();

    const fullName = [auth.user?.name, auth.user?.last_name]
        .filter(Boolean)
        .join(' ');

    const close = () => setOpenMobile(false);

    const handleLogout = () => {
        close();
        cleanup();
        router.flushAll();
    };

    return (
        <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 pb-[calc(var(--safe-bottom)+1rem)]">
            {/* Active Session Info */}
            <section className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-4">
                <p className="font-black tracking-wider text-[var(--fs-caption)] text-muted-foreground uppercase">
                    Sesión activa
                </p>
                <p className="mt-1 truncate text-base font-black text-foreground">
                    {fullName || auth.user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {auth.user?.email}
                </p>
            </section>

            {/* Navigation Modules */}
            {items.length > 0 && (
                <section className="flex flex-col gap-2">
                    <p className="px-1 font-black tracking-wider text-[var(--fs-caption)] text-muted-foreground uppercase">
                        Explorar
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item) => (
                            <NavTile
                                key={item.title}
                                item={item}
                                onNavigate={close}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Account Options */}
            <section className="flex flex-col gap-2">
                <p className="px-1 font-black tracking-wider text-[var(--fs-caption)] text-muted-foreground uppercase">
                    Cuenta
                </p>
                <div className="grid gap-3">
                    {accountItems.map((item) => (
                        <MenuCard
                            key={item.title}
                            item={item}
                            onNavigate={close}
                        />
                    ))}
                </div>
            </section>

            {/* Log Out Button */}
            <Link
                href={logout()}
                method="post"
                as="button"
                onClick={handleLogout}
                data-test="sidebar-logout-button"
                className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-secondary px-4 text-xs font-black tracking-wider text-red-400 uppercase transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 active:translate-y-0 active:scale-[0.99]"
            >
                <LogOut className="size-4 shrink-0" />
                <span>Cerrar sesión</span>
            </Link>
        </div>
    );
}

function NavTile({
    item,
    onNavigate,
}: {
    item: NavItem;
    onNavigate: () => void;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const Icon = item.icon;
    const active = isCurrentOrParentUrl(item.href);

    return (
        <Link
            href={item.href}
            prefetch
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group flex min-h-[76px] flex-col justify-between gap-2 rounded-2xl border bg-card p-3.5 transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_var(--shadow)]',
                active ? 'border-primary/40 bg-primary/5' : 'border-border',
            )}
        >
            {Icon && (
                <Icon
                    className={cn(
                        'size-4 shrink-0 transition-colors duration-250 group-hover:text-link',
                        active ? 'text-link' : 'text-muted-foreground',
                    )}
                />
            )}
            <span
                className={cn(
                    'text-sm font-bold transition-colors duration-250 group-hover:text-link',
                    active ? 'text-link' : 'text-foreground',
                )}
            >
                {item.title}
            </span>
        </Link>
    );
}

function MenuCard({
    item,
    onNavigate,
}: {
    item: AccountItem;
    onNavigate: () => void;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const Icon = item.icon;
    const active = isCurrentOrParentUrl(item.href);

    return (
        <Link
            href={item.href}
            prefetch
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex min-h-16 items-center gap-3.5 rounded-2xl border bg-card p-4 transition-all duration-300',
                'group hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_var(--shadow)]',
                active ? 'border-primary/40 bg-primary/5' : 'border-border',
            )}
        >
            <Icon
                className={cn(
                    'size-4 shrink-0 transition-colors duration-250 group-hover:text-link',
                    active ? 'text-link' : 'text-muted-foreground',
                )}
            />
            <span className="min-w-0">
                <span
                    className={cn(
                        'block text-sm leading-none font-bold transition-colors duration-250 group-hover:text-link',
                        active ? 'text-link' : 'text-foreground',
                    )}
                >
                    {item.title}
                </span>
                <span className="mt-1.5 block truncate text-xs text-muted-foreground">
                    {item.description}
                </span>
            </span>
        </Link>
    );
}
