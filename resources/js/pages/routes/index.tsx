import { Head, Link } from '@inertiajs/react';
import { ImageIcon, RouteIcon, Star } from 'lucide-react';
import Heading from '@/components/heading';
import { MobileTabs } from '@/components/mobile-tabs';
import RouteMap from '@/components/routes/route-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { mediaUrl } from '@/lib/media';
import type {
    CatalogOption,
    CyclingRouteMapItem,
    PaginatedRoutes,
} from '@/types';

type Props = {
    routes: PaginatedRoutes;
    categories: CatalogOption[];
    selectedCategory: number | null;
};

export default function RoutesIndex({
    routes,
    categories,
    selectedCategory,
}: Props) {
    return (
        <>
            <Head title="Rutas" />

            <div className="ueb-page flex flex-col gap-4 md:w-full">
                <div className="ueb-header-card">
                    <Heading
                        title="Rutas"
                        description="Elige una ruta, revisa el mapa o guarda tus favoritas."
                    />
                </div>

                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                />

                <MobileTabs
                    defaultValue="list"
                    items={[
                        {
                            value: 'list',
                            label: 'Rutas',
                            badge: routes.total,
                            content: <RoutesList routes={routes.data} />,
                        },
                        {
                            value: 'map',
                            label: 'Mapa',
                            content: (
                                <Card className="overflow-hidden">
                                    <CardHeader>
                                        <Badge
                                            variant="secondary"
                                            className="w-fit"
                                        >
                                            <RouteIcon data-icon="inline-start" />
                                            Mapa
                                        </Badge>
                                        <CardTitle>
                                            Mapa cicloturístico
                                        </CardTitle>
                                        <CardDescription>
                                            Activa capas y revisa puntos de
                                            interés antes de salir.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RouteMap
                                            routes={routes.data}
                                            mode="overview"
                                            className="[&_.leaflet-container]:h-[calc(100svh-260px)] [&_.leaflet-container]:min-h-96"
                                        />
                                    </CardContent>
                                </Card>
                            ),
                        },
                    ]}
                />

                {routes.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay rutas disponibles</CardTitle>
                            <CardDescription>
                                Vuelve a revisar más tarde.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm font-bold text-muted-foreground">
                    {routes.from ?? 0}-{routes.to ?? 0} de {routes.total} rutas.
                </div>
            </div>
        </>
    );
}

function CategoryFilter({
    categories,
    selectedCategory,
}: {
    categories: CatalogOption[];
    selectedCategory: number | null;
}) {
    return (
        <div className="ueb-chip-row -mx-1 px-1 py-1">
            <Button
                variant={selectedCategory === null ? 'secondary' : 'outline'}
                size="sm"
                asChild
                className="shrink-0 rounded-full px-4"
            >
                <Link href="/routes" replace prefetch>
                    Todas
                </Link>
            </Button>
            {categories.map((category) => (
                <Button
                    key={category.id}
                    variant={
                        selectedCategory === category.id
                            ? 'secondary'
                            : 'outline'
                    }
                    size="sm"
                    asChild
                    className="shrink-0 rounded-full px-4"
                >
                    <Link
                        href={`/routes?category=${category.id}`}
                        replace
                        prefetch
                    >
                        {category.name}
                    </Link>
                </Button>
            ))}
        </div>
    );
}

function RoutesList({ routes }: { routes: CyclingRouteMapItem[] }) {
    return (
        <div className="ueb-route-grid">
            {routes.map((route) => (
                <Link
                    key={route.id}
                    href={`/routes/${route.slug}`}
                    prefetch
                    className="ueb-route-card"
                >
                    <div className="flex items-start justify-between gap-2">
                        <RouteCover route={route} />
                        <div className="flex flex-wrap justify-end gap-1.5">
                            {route.user_interaction.is_favorite && (
                                <Badge variant="secondary">
                                    <Star data-icon="inline-start" />
                                    fav
                                </Badge>
                            )}
                            {route.incidents.length > 0 && (
                                <Badge variant="destructive">
                                    {route.incidents.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="ueb-route-title">{route.name}</h3>
                        <p className="ueb-route-meta line-clamp-2">
                            {route.start_name} - {route.end_name}
                        </p>
                        {route.metric && (
                            <div className="ueb-route-meta mt-1">
                                <span>
                                    {route.metric.distance_km.toLocaleString()}{' '}
                                    km
                                </span>
                                <span>•</span>
                                <span>
                                    {route.metric.estimated_time_minutes} min
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="ueb-route-actions">
                        <span className="ueb-difficulty-tag">
                            {route.difficulty?.name ??
                                route.category?.name ??
                                'Ruta'}
                        </span>
                        {route.rating_summary.average_rating !== null && (
                            <span className="ueb-stat-pill">
                                ★{' '}
                                {route.rating_summary.average_rating.toLocaleString()}
                            </span>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}

function RouteCover({ route }: { route: CyclingRouteMapItem }) {
    if (route.main_image_path) {
        return (
            <div className="ueb-route-thumb">
                <img src={mediaUrl(route.main_image_path)} alt={route.name} />
            </div>
        );
    }

    return (
        <div className="ueb-route-thumb">
            <ImageIcon className="size-6" />
        </div>
    );
}

RoutesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: '/routes',
        },
    ],
};
