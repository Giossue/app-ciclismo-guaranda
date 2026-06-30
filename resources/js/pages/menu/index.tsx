import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import Heading from '@/components/heading';
import { mainNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { Auth, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function MenuIndex() {
    const { auth } = usePage<PageProps>().props;
    const modules = mainNavItems(auth);

    return (
        <>
            <Head title="Menú" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Menú"
                    description="Accede a todos los módulos de Guaranda Go desde una vista rápida."
                />

                <section className="rounded-[2rem] border bg-card p-4 shadow-sm">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Sesión activa
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {auth.user?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {auth.user?.email}
                    </p>
                </section>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {modules.map((item, index) => (
                        <MenuCard
                            key={item.title}
                            item={item}
                            featured={index === 0}
                        />
                    ))}
                </section>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <Link
                        href={edit()}
                        prefetch
                        className="group flex min-h-36 flex-col justify-between rounded-[1.75rem] border bg-card p-4 shadow-sm transition-transform active:scale-[0.98]"
                    >
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground">
                            <Settings className="size-7" />
                        </span>
                        <span>
                            <span className="block text-base leading-tight font-semibold">
                                Perfil
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Cuenta y seguridad
                            </span>
                        </span>
                    </Link>

                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="group flex min-h-36 flex-col justify-between rounded-[1.75rem] border bg-card p-4 text-left text-destructive shadow-sm transition-transform active:scale-[0.98]"
                    >
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
                            <LogOut className="size-7" />
                        </span>
                        <span>
                            <span className="block text-base leading-tight font-semibold">
                                Salir
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Cerrar sesión
                            </span>
                        </span>
                    </Link>
                </section>
            </div>
        </>
    );
}

function MenuCard({ item, featured }: { item: NavItem; featured: boolean }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'group flex min-h-36 flex-col justify-between rounded-[1.75rem] border bg-card p-4 shadow-sm transition-transform active:scale-[0.98]',
                'hover:border-primary/40 hover:bg-primary/5',
                featured &&
                    'border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20',
            )}
        >
            <span
                className={cn(
                    'flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground transition-colors',
                    featured &&
                        'bg-primary-foreground/20 text-primary-foreground',
                )}
            >
                {Icon && <Icon className="size-7" />}
            </span>
            <span>
                <span className="block text-base leading-tight font-semibold">
                    {item.title}
                </span>
                <span
                    className={cn(
                        'text-xs text-muted-foreground',
                        featured && 'text-primary-foreground/75',
                    )}
                >
                    Abrir módulo
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
