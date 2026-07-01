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

            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-secondary/45 p-5 shadow-sm shadow-primary/10 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Rutas disponibles"
                        description="Explora rutas activas en mapa para planificar tu próximo recorrido en Bolívar"
                    />
                    <Button variant="outline" asChild>
                        <Link href="/favorites" prefetch>
                            Mis favoritas
                        </Link>
                    </Button>
                </div>

                <Card className="border-primary/10 bg-card/90">
                    <CardHeader>
                        <CardTitle>Filtrar por categoría</CardTitle>
                        <CardDescription>
                            Muestra solo las rutas de una categoría para navegar
                            con menos ruido visual.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button
                            variant={
                                selectedCategory === null
                                    ? 'secondary'
                                    : 'outline'
                            }
                            size="sm"
                            asChild
                        >
                            <Link href="/routes" prefetch>
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
                                    prefetch
                                >
                                    {category.name}
                                </Link>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-primary/10 bg-card/95">
                    <CardHeader>
                        <div className="flex flex-col gap-2">
                            <Badge variant="secondary" className="w-fit">
                                <RouteIcon data-icon="inline-start" />
                                Mapa de rutas activas
                            </Badge>
                            <CardTitle>Mapa cicloturístico</CardTitle>
                            <CardDescription>
                                Visualiza inicios, finales, POIs e incidencias.
                                Usa los filtros para activar trazados o capas
                                sin depender de tu ubicación.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RouteMap routes={routes.data} mode="overview" />
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {routes.data.map((route) => (
                        <Card
                            key={route.id}
                            className="group overflow-hidden border-primary/10 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/15"
                        >
                            <RouteCover route={route} />
                            <CardHeader>
                                <div className="flex flex-col gap-2">
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
                                                {route.incidents.length}{' '}
                                                incidencia
                                                {route.incidents.length === 1
                                                    ? ''
                                                    : 's'}
                                            </Badge>
                                        )}
                                        {route.user_interaction.is_favorite && (
                                            <Badge variant="secondary">
                                                <Star data-icon="inline-start" />
                                                favorita
                                            </Badge>
                                        )}
                                        {route.rating_summary.average_rating !==
                                            null && (
                                            <Badge variant="outline">
                                                ★{' '}
                                                {route.rating_summary.average_rating.toLocaleString()}{' '}
                                                (
                                                {
                                                    route.rating_summary
                                                        .approved_count
                                                }
                                                )
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl leading-tight">
                                        {route.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {route.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPinned />
                                    <span>
                                        {route.start_name} → {route.end_name}
                                    </span>
                                </div>
                                {route.metric && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <Bike />
                                            <span>
                                                {route.metric.distance_km.toLocaleString()}{' '}
                                                km
                                                {route.metric.transport_mode
                                                    ? ` · ${route.metric.transport_mode}`
                                                    : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock />
                                            <span>
                                                {
                                                    route.metric
                                                        .estimated_time_minutes
                                                }{' '}
                                                min
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" asChild>
                                    <Link
                                        href={`/routes/${route.slug}`}
                                        prefetch
                                    >
                                        Ver detalle
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {routes.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay rutas activas</CardTitle>
                            <CardDescription>
                                Las rutas publicadas por administración
                                aparecerán aquí cuando estén listas para
                                ciclistas.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {routes.from ?? 0}–{routes.to ?? 0} de{' '}
                    {routes.total} rutas activas.
                </div>
            </div>
        </>
    );
}

function RouteCover({ route }: { route: CyclingRouteMapItem }) {
    if (route.main_image_path) {
        return (
            <div className="relative h-48 overflow-hidden bg-muted sm:h-52">
                <img
                    src={mediaUrl(route.main_image_path)}
                    alt={route.name}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white">
                    <p className="text-xs font-medium tracking-wide uppercase opacity-90">
                        Ruta oficial
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/45 to-card text-muted-foreground sm:h-52">
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
