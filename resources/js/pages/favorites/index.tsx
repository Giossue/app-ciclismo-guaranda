import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Bike, Clock, HeartOff, MapPinned, Star } from 'lucide-react';
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
                <div className="flex items-center justify-between border-b border-border/40 py-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-black tracking-widest text-[var(--fs-caption)] text-muted-foreground uppercase">
                            Hola, {auth?.user?.name ?? 'Ciclista'}
                        </span>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Favoritas
                        </h1>
                    </div>
                </div>

                {/* Favorites List */}
                <div className="grid gap-4">
                    {favorites.data.map((favorite) =>
                        favorite.route ? (
                            <Card
                                key={favorite.route.id}
                                className="group overflow-hidden rounded-3xl border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_24px_var(--shadow)]"
                            >
                                <CardHeader className="gap-2">
                                    <div className="z-10 flex flex-wrap gap-1.5">
                                        <Badge>
                                            <Star data-icon="inline-start" />
                                            Favorita
                                        </Badge>
                                        {favorite.route.category && (
                                            <Badge variant="outline">
                                                {favorite.route.category.name}
                                            </Badge>
                                        )}
                                        {favorite.route.difficulty && (
                                            <Badge variant="outline">
                                                {favorite.route.difficulty.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg font-black text-foreground transition-colors duration-250 group-hover:text-link">
                                        {favorite.route.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                        {favorite.route.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="grid gap-2 text-xs text-foreground sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2.5">
                                        <MapPinned className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="line-clamp-1 font-bold text-muted-foreground">
                                            {favorite.route.start_name} →{' '}
                                            {favorite.route.end_name}
                                        </span>
                                    </div>
                                    {favorite.route.metric && (
                                        <>
                                            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2.5">
                                                <Bike className="size-4 shrink-0 text-primary" />
                                                <span className="font-bold text-foreground">
                                                    {favorite.route.metric.distance_km.toLocaleString()}{' '}
                                                    km
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-2.5">
                                                <Clock className="size-4 shrink-0 text-primary" />
                                                <span className="font-bold text-foreground">
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
                                    <Button asChild className="w-full">
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
                                                variant="secondary"
                                                disabled={processing}
                                                className="w-full"
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
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-border/50 text-muted-foreground/60">
                            <HeartOff className="size-4" />
                        </div>
                        <h2 className="text-base font-bold text-foreground">
                            No tienes favoritas
                        </h2>
                        <p className="mx-auto max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                            Guarda una ruta para verla aquí.
                        </p>
                    </div>
                )}

                <div className="pl-1 text-xs font-bold text-muted-foreground">
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
