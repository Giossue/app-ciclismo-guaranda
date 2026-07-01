import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import type { Auth } from '@/types';

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

    return (
        <>
            <Head title="Menú" />

            <div className="ueb-page flex flex-col gap-5 md:w-full">
                {/* Welcoming Header & Notifications Button */}
                <div className="flex items-center justify-between border-b border-[var(--input-border)]/40 py-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">
                            Hola, {auth?.user?.name ?? 'Ciclista'}
                        </span>
                        <h1 className="text-2xl font-black tracking-tight text-[var(--text-color)]">
                            Menú
                        </h1>
                    </div>

                    {/* Notification Bell Icon */}
                    <button
                        type="button"
                        className="relative flex size-11 items-center justify-center rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-color)] transition-all duration-200 hover:border-[#b2f000]/20 hover:bg-[var(--input-border)] hover:text-[#b2f000] active:scale-95"
                        aria-label="Notificaciones"
                    >
                        <Bell className="size-5" />
                        <span className="absolute top-3.5 right-3.5 size-2 rounded-full bg-[#b2f000] shadow-[0_0_8px_#b2f000]" />
                    </button>
                </div>

                {/* Active Session Info */}
                <section className="flex flex-col gap-0.5 rounded-2xl border border-[var(--input-border)] bg-[var(--bg-card-color)] p-4">
                    <p className="text-[10px] font-black tracking-wider text-[var(--text-secondary)] uppercase">
                        Sesión activa
                    </p>
                    <p className="mt-1 text-base font-black text-[var(--text-color)]">
                        {auth.user?.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {auth.user?.email}
                    </p>
                </section>

                {/* Options Cards */}
                <section className="grid gap-3">
                    {accountItems.map((item) => (
                        <MenuCard key={item.title} item={item} />
                    ))}
                </section>

                {/* Log Out Button */}
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-[var(--input-bg)] px-4 text-xs font-black tracking-wider text-red-400 uppercase transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 active:translate-y-0 active:scale-[0.99]"
                >
                    <LogOut className="size-5 shrink-0" />
                    <span>Cerrar sesión</span>
                </Link>
            </div>
        </>
    );
}

function MenuCard({ item }: { item: AccountItem }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'flex min-h-16 items-center gap-3.5 rounded-2xl border border-[var(--input-border)] bg-[var(--bg-card-color)] p-4 transition-all duration-300',
                'group hover:-translate-y-0.5 hover:border-[#b2f000]/40 hover:shadow-[0_4px_16px_var(--shadow-color)]',
            )}
        >
            <Icon className="size-5.5 shrink-0 text-[var(--text-secondary)] transition-colors duration-250 group-hover:text-[#b2f000]" />
            <span className="min-w-0">
                <span className="block text-sm leading-none font-bold text-[var(--text-color)] transition-colors duration-250 group-hover:text-[#b2f000]">
                    {item.title}
                </span>
                <span className="mt-1.5 block truncate text-xs text-[var(--text-secondary)]">
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
