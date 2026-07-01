import { Head, Link } from '@inertiajs/react';
import {
    Bike,
    Clock,
    ImageIcon,
    MapPinned,
    RouteIcon,
    Star,
} from 'lucide-react';
import Heading from '@/components/heading';
import { MobileTabs } from '@/components/mobile-tabs';
import RouteMap from '@/components/routes/route-map';
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

            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border bg-card p-4">
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

                <div className="text-sm text-muted-foreground">
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
        <div className="-mx-4 overflow-x-auto border-y bg-card px-4 py-2 md:mx-0 md:rounded-2xl md:border">
            <div className="flex w-max min-w-full gap-2">
                <Button
                    variant={
                        selectedCategory === null ? 'secondary' : 'outline'
                    }
                    size="sm"
                    asChild
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
        </div>
    );
}

function RoutesList({ routes }: { routes: CyclingRouteMapItem[] }) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {routes.map((route) => (
                <Card key={route.id} className="group overflow-hidden">
                    <RouteCover route={route} />
                    <CardHeader className="gap-2">
                        <div className="flex flex-wrap gap-2">
                            {route.category && (
                                <Badge variant="outline">
                                    {route.category.name}
                                </Badge>
                            )}
                            {route.difficulty && (
                                <Badge variant="secondary">
                                    {route.difficulty.name}
                                </Badge>
                            )}
                            {route.incidents.length > 0 && (
                                <Badge variant="destructive">
                                    {route.incidents.length} alerta
                                    {route.incidents.length === 1 ? '' : 's'}
                                </Badge>
                            )}
                            {route.user_interaction.is_favorite && (
                                <Badge variant="secondary">
                                    <Star data-icon="inline-start" />
                                    favorita
                                </Badge>
                            )}
                            {route.rating_summary.average_rating !== null && (
                                <Badge variant="outline">
                                    ★{' '}
                                    {route.rating_summary.average_rating.toLocaleString()}
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-xl leading-tight">
                            {route.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {route.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPinned />
                            <span className="line-clamp-1">
                                {route.start_name} → {route.end_name}
                            </span>
                        </div>
                        {route.metric && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-2">
                                    <Bike />
                                    <span>
                                        {route.metric.distance_km.toLocaleString()}{' '}
                                        km
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-2">
                                    <Clock />
                                    <span>
                                        {route.metric.estimated_time_minutes}{' '}
                                        min
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href={`/routes/${route.slug}`} prefetch>
                                Ver ruta
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

function RouteCover({ route }: { route: CyclingRouteMapItem }) {
    if (route.main_image_path) {
        return (
            <div className="relative h-40 overflow-hidden bg-muted sm:h-44">
                <img
                    src={mediaUrl(route.main_image_path)}
                    alt={route.name}
                    className="size-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className="flex h-40 items-center justify-center border-b bg-muted text-muted-foreground sm:h-44">
            <div className="flex flex-col items-center gap-2 text-center">
                <ImageIcon className="size-8" />
                <span className="text-sm font-medium">Sin portada</span>
            </div>
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
