import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ImageIcon, RouteIcon, Star } from 'lucide-react';
import CyclistRouteController from '@/actions/App/Http/Controllers/Cyclist/RouteController';
import { CatalogPagination } from '@/components/catalog-pagination';
import ImageWithFallback from '@/components/image-with-fallback';
import { MobileTabs } from '@/components/mobile-tabs';
import RouteMap from '@/components/routes/client-only-route-map';
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

            <div className="flex w-full flex-col gap-5">
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
                            content: (
                                <RoutesList
                                    routes={routes.data}
                                    selectedCategory={selectedCategory}
                                    showLatestBadge={routes.current_page === 1}
                                />
                            ),
                        },
                        {
                            value: 'map',
                            label: 'Mapa',
                            content: (
                                <Card className="overflow-hidden">
                                    <CardHeader>
                                        <Badge variant="outline">
                                            <RouteIcon data-icon="inline-start" />
                                            Mapa
                                        </Badge>
                                        <CardTitle>
                                            Mapa cicloturístico
                                        </CardTitle>
                                        <CardDescription>
                                            Revisa el trazado y los puntos de
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

                <CatalogPagination
                    pagination={routes}
                    itemLabel="rutas"
                    buildPageUrl={(page) =>
                        CyclistRouteController.index.url({
                            query: {
                                category: selectedCategory ?? undefined,
                                page,
                            },
                        })
                    }
                />
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
        <nav
            aria-label="Filtrar rutas por categoría"
            className="ueb-chip-row -mx-1 px-1 py-1 sm:mx-auto sm:justify-center"
        >
            <Button
                variant={selectedCategory === null ? 'secondary' : 'outline'}
                size="sm"
                asChild
                className="shrink-0 rounded-full px-4"
            >
                <Link
                    href={CyclistRouteController.index.url()}
                    replace
                    prefetch
                >
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
                        href={CyclistRouteController.index.url({
                            query: { category: category.id },
                        })}
                        replace
                        prefetch
                    >
                        {category.name}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}

function RoutesList({
    routes,
    selectedCategory,
    showLatestBadge,
}: {
    routes: CyclingRouteMapItem[];
    selectedCategory: number | null;
    showLatestBadge: boolean;
}) {
    if (routes.length === 0) {
        return (
            <Empty className="min-h-72 border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <RouteIcon />
                    </EmptyMedia>
                    <EmptyTitle>
                        {selectedCategory === null
                            ? 'No hay rutas disponibles'
                            : 'No hay rutas en esta categoría'}
                    </EmptyTitle>
                    <EmptyDescription>
                        {selectedCategory === null
                            ? 'Vuelve a revisar más tarde.'
                            : 'Prueba con otra categoría para seguir explorando.'}
                    </EmptyDescription>
                </EmptyHeader>
                {selectedCategory !== null && (
                    <EmptyContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={CyclistRouteController.index.url()}
                                replace
                            >
                                Ver todas las rutas
                            </Link>
                        </Button>
                    </EmptyContent>
                )}
            </Empty>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route, index) => (
                <RouteCard
                    key={route.id}
                    route={route}
                    isLatest={showLatestBadge && index === 0}
                />
            ))}
        </div>
    );
}

function RouteCard({
    isLatest,
    route,
}: {
    isLatest: boolean;
    route: CyclingRouteMapItem;
}) {
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
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    {isLatest ? <Badge>Más reciente</Badge> : <span />}
                    <div className="flex flex-wrap justify-end gap-1.5">
                        {route.user_interaction.is_favorite && (
                            <Badge>
                                <Star data-icon="inline-start" />
                                Favorita
                            </Badge>
                        )}
                        {route.incidents.length > 0 && (
                            <Badge>
                                <AlertTriangle data-icon="inline-start" />
                                {route.incidents.length}{' '}
                                {route.incidents.length === 1
                                    ? 'alerta'
                                    : 'alertas'}
                            </Badge>
                        )}
                    </div>
                </div>
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

            <CardFooter className="border-t py-3">
                <Button asChild variant="outline" className="w-full">
                    <Link href={routeUrl} prefetch>
                        Ver ruta
                    </Link>
                </Button>
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

RoutesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: CyclistRouteController.index.url(),
        },
    ],
};
