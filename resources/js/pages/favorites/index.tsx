import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Bell, Bike, Clock, HeartOff, MapPinned, Star } from 'lucide-react';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { CatalogOption, RouteMetric } from '@/types';

type FavoriteRouteItem = {
    route: {
        id: number;
        name: string;
        slug: string;
        description: string;
        start_name: string;
        end_name: string;
        route_version: number;
        status: CatalogOption | null;
        category: CatalogOption | null;
        difficulty: CatalogOption | null;
        metric: Pick<
            RouteMetric,
            'distance_km' | 'estimated_time_minutes' | 'transport_mode'
        > | null;
    } | null;
    favorited_at: string | null;
};

type PaginatedFavorites = {
    data: FavoriteRouteItem[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    favorites: PaginatedFavorites;
};

export default function FavoritesIndex({ favorites }: Props) {
    const { auth } = usePage<any>().props;

    return (
        <>
            <Head title="Favoritas" />

            <div className="ueb-page flex flex-col gap-5 md:w-full">
                {/* Welcoming Header & Notifications Button */}
                <div className="flex items-center justify-between border-b border-[var(--input-border)]/40 py-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">
                            Hola, {auth?.user?.name ?? 'Ciclista'}
                        </span>
                        <h1 className="text-2xl font-black tracking-tight text-[var(--text-color)]">
                            Favoritas
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

                {/* Favorites List */}
                <div className="grid gap-4">
                    {favorites.data.map((favorite) =>
                        favorite.route ? (
                            <Card
                                key={favorite.route.id}
                                className="group overflow-hidden rounded-3xl border-[var(--input-border)] bg-[var(--bg-card-color)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b2f000]/40 hover:shadow-[0_8px_24px_var(--shadow-color)]"
                            >
                                <CardHeader className="gap-2">
                                    <div className="z-10 flex flex-wrap gap-1.5">
                                        <Badge className="flex items-center gap-1 rounded-lg border border-[#b2f000]/20 bg-[#b2f000]/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#b2f000] uppercase hover:bg-[#b2f000]/10">
                                            <Star className="size-2.5 fill-[#b2f000] text-[#b2f000]" />
                                            <span>Favorita</span>
                                        </Badge>
                                        {favorite.route.category && (
                                            <Badge className="rounded-lg border border-[#b2f000]/10 bg-[#b2f000]/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-[#b2f000] uppercase">
                                                {favorite.route.category.name}
                                            </Badge>
                                        )}
                                        {favorite.route.difficulty && (
                                            <Badge className="rounded-lg border border-[#b2f000]/10 bg-[#b2f000]/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-[#b2f000] uppercase">
                                                {favorite.route.difficulty.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg font-black text-[var(--text-color)] transition-colors duration-250 group-hover:text-[#b2f000]">
                                        {favorite.route.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                                        {favorite.route.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="grid gap-2 text-xs text-[var(--text-color)] sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5">
                                        <MapPinned className="size-4 shrink-0 text-[var(--text-secondary)]" />
                                        <span className="line-clamp-1 font-bold text-[var(--text-secondary)]">
                                            {favorite.route.start_name} →{' '}
                                            {favorite.route.end_name}
                                        </span>
                                    </div>
                                    {favorite.route.metric && (
                                        <>
                                            <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5">
                                                <Bike className="size-4 shrink-0 text-[#b2f000]" />
                                                <span className="font-bold text-[var(--text-color)]">
                                                    {favorite.route.metric.distance_km.toLocaleString()}{' '}
                                                    km
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5">
                                                <Clock className="size-4 shrink-0 text-[#b2f000]" />
                                                <span className="font-bold text-[var(--text-color)]">
                                                    {
                                                        favorite.route.metric
                                                            .estimated_time_minutes
                                                    }{' '}
                                                    min
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>

                                <CardFooter className="mt-2 grid gap-3 sm:grid-cols-2">
                                    <Button
                                        asChild
                                        className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase transition-all duration-200 hover:bg-[#9ad000] active:scale-95"
                                    >
                                        <Link
                                            href={`/routes/${favorite.route.slug}`}
                                            prefetch
                                        >
                                            Ver ruta
                                        </Link>
                                    </Button>
                                    <Form
                                        {...FavoriteRouteController.destroy.form(
                                            favorite.route.slug,
                                        )}
                                        options={{ preserveScroll: true }}
                                        className="w-full"
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-xs font-black tracking-wider text-[var(--text-secondary)] uppercase transition-all duration-200 hover:bg-[var(--input-border)] hover:text-[var(--text-color)]"
                                            >
                                                <HeartOff className="size-4 shrink-0" />
                                                <span>Quitar</span>
                                            </Button>
                                        )}
                                    </Form>
                                </CardFooter>
                            </Card>
                        ) : null,
                    )}
                </div>

                {/* Empty State */}
                {favorites.data.length === 0 && (
                    <Card className="rounded-3xl border-dashed border-[var(--input-border)] bg-[var(--input-bg)]/50 px-6 py-12 text-center backdrop-blur-sm">
                        <CardHeader className="flex flex-col items-center gap-2">
                            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-[var(--input-border)]/50 text-[var(--text-secondary)]/60">
                                <HeartOff className="size-7" />
                            </div>
                            <CardTitle className="text-base font-bold text-[var(--text-color)]">
                                No tienes favoritas
                            </CardTitle>
                            <CardDescription className="mx-auto max-w-[240px] text-xs leading-relaxed text-[var(--text-secondary)]">
                                Guarda una ruta para verla aquí.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="pl-1 text-xs font-bold text-[var(--text-secondary)]">
                    {favorites.from ?? 0}-{favorites.to ?? 0} de{' '}
                    {favorites.total} favoritas.
                </div>
            </div>
        </>
    );
}

FavoritesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Favoritas',
            href: '/favorites',
        },
    ],
};
