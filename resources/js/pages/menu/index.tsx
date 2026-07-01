import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, Palette, ShieldCheck, UserRound } from 'lucide-react';
import Heading from '@/components/heading';
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

            <div className="flex flex-col gap-4">
                <Heading title="Menú" description="Ajustes de tu cuenta." />

                <section className="rounded-2xl border bg-card p-4">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Sesión activa
                    </p>
                    <p className="mt-1 text-base font-semibold">
                        {auth.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {auth.user?.email}
                    </p>
                </section>

                <section className="grid gap-2.5">
                    {accountItems.map((item) => (
                        <MenuCard key={item.title} item={item} />
                    ))}
                </section>

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="size-5" />
                    Cerrar sesión
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
                'flex min-h-16 items-center gap-3 rounded-2xl border bg-card p-3 transition-colors',
                'hover:border-primary/30 hover:bg-accent/70',
            )}
        >
            <Icon className="size-6 shrink-0" />
            <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold">
                    {item.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
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
