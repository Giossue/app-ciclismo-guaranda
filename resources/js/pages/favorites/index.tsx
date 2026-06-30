import { Form, Head, Link } from '@inertiajs/react';
import { Bike, Clock, HeartOff, MapPinned, Star } from 'lucide-react';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import Heading from '@/components/heading';
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
    return (
        <>
            <Head title="Rutas favoritas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Rutas favoritas"
                        description="Tus rutas guardadas para consultarlas rápido antes de salir"
                    />
                    <Button variant="outline" asChild>
                        <Link href="/routes" prefetch>
                            Ver rutas
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {favorites.data.map((favorite) =>
                        favorite.route ? (
                            <Card key={favorite.route.id}>
                                <CardHeader>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                <Star data-icon="inline-start" />
                                                favorita
                                            </Badge>
                                            {favorite.route.status && (
                                                <Badge variant="outline">
                                                    {favorite.route.status.name}
                                                </Badge>
                                            )}
                                            {favorite.route.category && (
                                                <Badge variant="outline">
                                                    {
                                                        favorite.route.category
                                                            .name
                                                    }
                                                </Badge>
                                            )}
                                            {favorite.route.difficulty && (
                                                <Badge variant="secondary">
                                                    {
                                                        favorite.route
                                                            .difficulty.name
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle>
                                            {favorite.route.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {favorite.route.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                                    <div className="flex items-center gap-2">
                                        <MapPinned />
                                        <span>
                                            {favorite.route.start_name} →{' '}
                                            {favorite.route.end_name}
                                        </span>
                                    </div>
                                    {favorite.route.metric && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Bike />
                                                <span>
                                                    {favorite.route.metric.distance_km.toLocaleString()}{' '}
                                                    km
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock />
                                                <span>
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

                                <CardFooter className="flex flex-wrap gap-2">
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`/routes/${favorite.route.slug}`}
                                            prefetch
                                        >
                                            Ver detalle
                                        </Link>
                                    </Button>
                                    <Form
                                        {...FavoriteRouteController.destroy.form(
                                            favorite.route.slug,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                            >
                                                <HeartOff data-icon="inline-start" />
                                                Quitar
                                            </Button>
                                        )}
                                    </Form>
                                </CardFooter>
                            </Card>
                        ) : null,
                    )}
                </div>

                {favorites.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No tienes rutas favoritas</CardTitle>
                            <CardDescription>
                                Guarda una ruta desde su detalle para
                                encontrarla aquí rápidamente.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {favorites.from ?? 0}–{favorites.to ?? 0} de{' '}
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
