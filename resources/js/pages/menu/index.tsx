import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, UserRound } from 'lucide-react';
import Heading from '@/components/heading';
import { mainNavItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { Auth, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
};

const descriptions: Record<string, string> = {
    Resumen: 'Estado general',
    Rutas: 'Rutas oficiales',
    POIs: 'Lugares y servicios',
    Incidencias: 'Reportes activos',
    Usuarios: 'Cuentas y roles',
    Valoraciones: 'Opiniones revisadas',
    Catálogos: 'Datos base',
    Estadísticas: 'Métricas y reportes',
    Configuración: 'Estado del sistema',
    Favoritas: 'Rutas guardadas',
    'Asistente IA': 'Ayuda turística',
};

export default function MenuIndex() {
    const { auth } = usePage<PageProps>().props;
    const modules = mainNavItems(auth);

    return (
        <>
            <Head title="Menú" />

            <div className="flex flex-col gap-4">
                <Heading
                    title="Menú"
                    description="Todos los módulos de Guaranda Go."
                />

                <section className="rounded-2xl border bg-card p-3 shadow-sm">
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

                <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                    {modules.map((item) => (
                        <MenuCard key={item.title} item={item} />
                    ))}

                    <Link
                        href={edit()}
                        prefetch
                        className="flex min-h-20 items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-transform active:scale-[0.98]"
                    >
                        <UserRound className="size-6 shrink-0" />
                        <span className="min-w-0">
                            <span className="block text-sm leading-tight font-semibold">
                                Perfil
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                                Cuenta segura
                            </span>
                        </span>
                    </Link>
                </section>

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold text-destructive shadow-sm transition-transform active:scale-[0.99]"
                >
                    <LogOut className="size-5" />
                    Cerrar sesión
                </Link>
            </div>
        </>
    );
}

function MenuCard({ item }: { item: NavItem }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            prefetch
            className={cn(
                'flex min-h-20 items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-transform active:scale-[0.98]',
                'hover:border-primary/40 hover:bg-primary/5',
            )}
        >
            {Icon && <Icon className="size-6 shrink-0" />}
            <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold">
                    {item.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                    {descriptions[item.title] ?? 'Acceso rápido'}
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
