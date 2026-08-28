import { Form, Head, Link } from '@inertiajs/react';
import { HeartOff, ImageIcon, Star, X } from 'lucide-react';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import CyclistRouteController from '@/actions/App/Http/Controllers/Cyclist/RouteController';
import { CatalogPagination } from '@/components/catalog-pagination';
import Heading from '@/components/heading';
import ImageWithFallback from '@/components/image-with-fallback';
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { mediaUrl } from '@/lib/media';
import { index as mapsIndex } from '@/routes/maps';
import type { CatalogOption, RouteMetric } from '@/types';

type FavoriteRouteItem = {
    route: {
        id: number;
        name: string;
        slug: string;
        description: string;
        main_image_path: string | null;
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
    current_page: number;
    data: FavoriteRouteItem[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type Props = {
    favorites: PaginatedFavorites;
};

export default function FavoritesIndex({ favorites }: Props) {
    return (
        <>
            <Head title="Favoritas" />

            <div className="flex w-full flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                    <Heading
                        title="Rutas favoritas"
                        description="Encuentra rápidamente las rutas que guardaste para tu próxima salida."
                    />
                    <Button asChild variant="ghost" size="icon">
                        <Link
                            href={mapsIndex.url()}
                            replace
                            aria-label="Volver al mapa"
                            title="Volver al mapa"
                        >
                            <X />
                        </Link>
                    </Button>
                </div>

                {favorites.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.data.map((favorite) =>
                            favorite.route ? (
                                <FavoriteCard
                                    key={favorite.route.id}
                                    favorite={favorite}
                                />
                            ) : null,
                        )}
                    </div>
                ) : (
                    <Empty className="min-h-72 border border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <HeartOff />
                            </EmptyMedia>
                            <EmptyTitle>No tienes rutas favoritas</EmptyTitle>
                            <EmptyDescription>
                                Guarda una ruta para encontrarla rápidamente
                                antes de tu próxima salida.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={CyclistRouteController.index.url()}
                                    prefetch
                                >
                                    Explorar rutas
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                )}

                <CatalogPagination
                    pagination={favorites}
                    itemLabel="favoritas"
                    buildPageUrl={(page) =>
                        FavoriteRouteController.index.url({ query: { page } })
                    }
                />
            </div>
        </>
    );
}

function FavoriteCard({ favorite }: { favorite: FavoriteRouteItem }) {
    const route = favorite.route;

    if (!route) {
        return null;
    }

    const routeUrl = CyclistRouteController.show.url(route.slug);

    return (
        <Card className="group h-full gap-0 overflow-hidden py-0 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary">
            <Link
                href={routeUrl}
                prefetch
                className="relative block aspect-[16/9] overflow-hidden bg-muted"
                aria-label={`Ver ${route.name}`}
            >
                <ImageWithFallback
                    src={mediaUrl(route.main_image_path)}
                    alt={`Vista de ${route.name}`}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    fallback={
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                            <ImageIcon />
                            <span className="sr-only">
                                Esta ruta no tiene imagen principal
                            </span>
                        </div>
                    }
                />
                <Badge className="absolute top-3 left-3">
                    <Star data-icon="inline-start" />
                    Favorita
                </Badge>
            </Link>

            <CardHeader className="gap-2 pt-4">
                <div className="flex flex-wrap gap-2">
                    {route.category && (
                        <Badge variant="outline">{route.category.name}</Badge>
                    )}
                    {route.difficulty && (
                        <Badge variant="outline">{route.difficulty.name}</Badge>
                    )}
                </div>
                <CardTitle className="line-clamp-2 text-lg">
                    <Link
                        href={routeUrl}
                        prefetch
                        className="transition-colors hover:text-link"
                    >
                        {route.name}
                    </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {route.start_name} → {route.end_name}
                </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto grid grid-cols-2 gap-3 pb-4 text-sm">
                <RouteMetric
                    label="Distancia"
                    value={
                        route.metric
                            ? `${route.metric.distance_km.toLocaleString()} km`
                            : 'Sin dato'
                    }
                />
                <RouteMetric
                    label="Tiempo"
                    value={
                        route.metric
                            ? `${route.metric.estimated_time_minutes} min`
                            : 'Sin dato'
                    }
                />
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2 border-t py-3">
                <Button asChild variant="outline" className="w-full">
                    <Link href={routeUrl} prefetch>
                        Ver ruta
                    </Link>
                </Button>
                <Form
                    {...FavoriteRouteController.destroy.form(route.slug)}
                    options={{ preserveScroll: true }}
                    className="w-full"
                >
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={processing}
                            className="w-full"
                        >
                            <HeartOff data-icon="inline-start" />
                            {processing ? 'Quitando…' : 'Quitar'}
                        </Button>
                    )}
                </Form>
            </CardFooter>
        </Card>
    );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="truncate font-bold text-foreground">{value}</span>
        </div>
    );
}

FavoritesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Favoritas',
            href: FavoriteRouteController.index.url(),
        },
    ],
};
