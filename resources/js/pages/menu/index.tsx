import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { mobileMoreNavItems } from '@/lib/navigation';
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
    icon: typeof UserRound;
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

export default function MenuIndex() {
    const { auth } = usePage<PageProps>().props;
    const moduleItems = mobileMoreNavItems(auth);

    const fullName = [auth.user?.name, auth.user?.last_name]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <Head title="Menú" />

            <div className="ueb-page flex flex-col gap-5 md:w-full">
                {/* Active Session Info */}
                <section className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-4">
                    <p className="font-black tracking-wider text-[var(--fs-caption)] text-muted-foreground uppercase">
                        Sesión activa
                    </p>
                    <p className="mt-1 text-base font-black text-foreground">
                        {fullName || auth.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {auth.user?.email}
                    </p>
                </section>

                {/* Navigation Modules */}
                {moduleItems.length > 0 && (
                    <section className="flex flex-col gap-2">
                        <p className="px-1 font-black tracking-wider text-[var(--fs-caption)] text-muted-foreground uppercase">
                            Explorar
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {moduleItems.map((item) => (
                                <NavTile key={item.title} item={item} />
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
                            <MenuCard key={item.title} item={item} />
                        ))}
                    </div>
                </section>

                {/* Log Out Button */}
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-secondary px-4 text-xs font-black tracking-wider text-red-400 uppercase transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 active:translate-y-0 active:scale-[0.99]"
                >
                    <LogOut className="size-4 shrink-0" />
                    <span>Cerrar sesión</span>
                </Link>
            </div>
        </>
    );
}

function NavTile({ item }: { item: NavItem }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'group flex min-h-[76px] flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-3.5 transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_var(--shadow)]',
            )}
        >
            {Icon && (
                <Icon className="size-4 shrink-0 text-muted-foreground transition-colors duration-250 group-hover:text-link" />
            )}
            <span className="text-sm font-bold text-foreground transition-colors duration-250 group-hover:text-link">
                {item.title}
            </span>
        </Link>
    );
}

function MenuCard({ item }: { item: AccountItem }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'flex min-h-16 items-center gap-3.5 rounded-2xl border border-border bg-card p-4 transition-all duration-300',
                'group hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_4px_16px_var(--shadow)]',
            )}
        >
            <Icon className="size-4 shrink-0 text-muted-foreground transition-colors duration-250 group-hover:text-link" />
            <span className="min-w-0">
                <span className="block text-sm leading-none font-bold text-foreground transition-colors duration-250 group-hover:text-link">
                    {item.title}
                </span>
                <span className="mt-1.5 block truncate text-xs text-muted-foreground">
                    {item.description}
                </span>
            </span>
        </Link>
    );
}

MenuIndex.layout = {
    breadcrumbs: [
        {
            title: 'Menú',
            href: '/menu',
        },
    ],
};
