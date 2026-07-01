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
            <Head title="Favoritas" />

            <div className="flex flex-col gap-4">
                <div className="rounded-lg border bg-card p-4">
                    <Heading
                        title="Favoritas"
                        description="Tus rutas guardadas para encontrarlas rápido."
                    />
                </div>

                <div className="grid gap-3">
                    {favorites.data.map((favorite) =>
                        favorite.route ? (
                            <Card key={favorite.route.id}>
                                <CardHeader className="gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">
                                            <Star data-icon="inline-start" />
                                            favorita
                                        </Badge>
                                        {favorite.route.category && (
                                            <Badge variant="outline">
                                                {favorite.route.category.name}
                                            </Badge>
                                        )}
                                        {favorite.route.difficulty && (
                                            <Badge variant="secondary">
                                                {favorite.route.difficulty.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle>{favorite.route.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {favorite.route.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
                                        <MapPinned />
                                        <span className="line-clamp-1">
                                            {favorite.route.start_name} →{' '}
                                            {favorite.route.end_name}
                                        </span>
                                    </div>
                                    {favorite.route.metric && (
                                        <>
                                            <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
                                                <Bike />
                                                <span>
                                                    {favorite.route.metric.distance_km.toLocaleString()}{' '}
                                                    km
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
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

                                <CardFooter className="grid gap-2 sm:grid-cols-2">
                                    <Button asChild>
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
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                                className="w-full"
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
                            <CardTitle>No tienes favoritas</CardTitle>
                            <CardDescription>
                                Guarda una ruta para verla aquí.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    {favorites.from ?? 0}–{favorites.to ?? 0} de{' '}
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
