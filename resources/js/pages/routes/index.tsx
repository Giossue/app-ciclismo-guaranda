import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bike,
    Clock,
    MapPinned,
    RouteIcon,
    Star,
} from 'lucide-react';
import CyclistRouteController from '@/actions/App/Http/Controllers/Cyclist/RouteController';
import { CatalogPagination } from '@/components/catalog-pagination';
import { DataTableToolbar } from '@/components/data-table';
import type { DataTableQuery } from '@/components/data-table';
import ImageWithFallback from '@/components/image-with-fallback';
import { MobileTabs } from '@/components/mobile-tabs';
import RouteMap from '@/components/routes/client-only-route-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CardGrid } from '@/components/ui/card-grid';
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

type RouteFilters = {
    category: string;
    difficulty: string;
    search: string;
};

type Props = {
    routes: PaginatedRoutes;
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    filters: RouteFilters;
};

export default function RoutesIndex({
    routes,
    categories,
    difficulties,
    filters,
}: Props) {
    const hasFilters = Object.values(filters).some((value) => value !== '');

    const changeQuery = (query: DataTableQuery) => {
        router.get(CyclistRouteController.index.url(), query, {
            only: ['routes', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const openRoute = (route: CyclingRouteMapItem) => {
        router.visit(CyclistRouteController.show.url(route.slug));
    };

    return (
        <>
            <Head title="Rutas" />

            <div className="flex w-full flex-col gap-5">
                <RouteFiltersToolbar
                    categories={categories}
                    difficulties={difficulties}
                    filters={filters}
                    onQueryChange={changeQuery}
                />

                <MobileTabs
                    defaultValue="map"
                    items={[
                        {
                            value: 'list',
                            label: 'Rutas',
                            badge: routes.total,
                            content: (
                                <RoutesList
                                    routes={routes.data}
                                    hasFilters={hasFilters}
                                    showLatestBadge={
                                        routes.current_page === 1 && !hasFilters
                                    }
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
                                            onRouteSelect={openRoute}
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
                                search: filters.search || undefined,
                                category: filters.category || undefined,
                                difficulty: filters.difficulty || undefined,
                                page,
                            },
                        })
                    }
                />
            </div>
        </>
    );
}

function RouteFiltersToolbar({
    categories,
    difficulties,
    filters,
    onQueryChange,
}: {
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    filters: RouteFilters;
    onQueryChange: (query: DataTableQuery) => void;
}) {
    return (
        <Card className="data-table">
            <CardContent>
                <DataTableToolbar
                    query={filters}
                    onQueryChange={onQueryChange}
                    searchPlaceholder="Buscar por nombre, descripción u origen"
                    filters={[
                        {
                            id: 'category',
                            label: 'Filtrar por categoría',
                            placeholder: 'Todas las categorías',
                            options: categories.map((category) => ({
                                label: category.name,
                                value: String(category.id),
                            })),
                        },
                        {
                            id: 'difficulty',
                            label: 'Filtrar por dificultad',
                            placeholder: 'Todas las dificultades',
                            options: difficulties.map((difficulty) => ({
                                label: difficulty.name,
                                value: String(difficulty.id),
                            })),
                        },
                    ]}
                />
            </CardContent>
        </Card>
    );
}

function RoutesList({
    routes,
    hasFilters,
    showLatestBadge,
}: {
    routes: CyclingRouteMapItem[];
    hasFilters: boolean;
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
                        {hasFilters
                            ? 'No encontramos rutas con esos filtros'
                            : 'No hay rutas disponibles'}
                    </EmptyTitle>
                    <EmptyDescription>
                        {hasFilters
                            ? 'Prueba con otra búsqueda o ajusta los filtros.'
                            : 'Vuelve a revisar más tarde.'}
                    </EmptyDescription>
                </EmptyHeader>
                {hasFilters && (
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
        <CardGrid layout="lg-3" className="grid-cols-1 gap-4 md:grid-cols-2">
            {routes.map((route, index) => (
                <RouteCard
                    key={route.id}
                    route={route}
                    isLatest={showLatestBadge && index === 0}
                />
            ))}
        </CardGrid>
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
        <Link
            href={routeUrl}
            prefetch
            aria-label={`Ver ${route.name}`}
            className="block h-full"
        >
            <Card className="h-full overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary">
                <ImageWithFallback
                    src={mediaUrl(route.main_image_path)}
                    alt={`Vista de ${route.name}`}
                    className="h-36 w-full object-cover"
                    fallback={
                        <div className="flex h-36 items-center justify-center bg-muted text-muted-foreground">
                            <MapPinned aria-hidden="true" />
                            <span className="sr-only">
                                Esta ruta no tiene imagen principal
                            </span>
                        </div>
                    }
                />
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-2">
                            {isLatest && <Badge>Más reciente</Badge>}
                            <div className="flex flex-wrap gap-1.5">
                                {route.category && (
                                    <Badge>{route.category.name}</Badge>
                                )}
                                {route.difficulty && (
                                    <Badge variant="outline">
                                        {route.difficulty.name}
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="font-normal tracking-normal">
                                {route.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {route.description}
                            </CardDescription>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
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
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                    <div className="flex gap-2 text-muted-foreground">
                        <MapPinned className="mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">
                            {route.start_name} → {route.end_name}
                        </span>
                    </div>
                    <div className="flex gap-2 border-t pt-3">
                        <Bike className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Distancia
                            </p>
                            <p className="font-semibold">
                                {route.metric
                                    ? `${route.metric.distance_km} km`
                                    : 'Sin dato'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 border-t pt-3">
                        <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Tiempo estimado
                            </p>
                            <p className="font-semibold">
                                {route.metric
                                    ? `${route.metric.estimated_time_minutes} min`
                                    : 'Sin dato'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
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
