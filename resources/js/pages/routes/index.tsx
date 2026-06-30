import { Head, Link } from '@inertiajs/react';
import { Bike, Clock, MapPinned, RouteIcon, Star } from 'lucide-react';
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
import type { PaginatedRoutes } from '@/types';

type Props = {
    routes: PaginatedRoutes;
};

export default function RoutesIndex({ routes }: Props) {
    return (
        <>
            <Head title="Rutas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-2">
                            <Badge variant="secondary" className="w-fit">
                                <RouteIcon data-icon="inline-start" />
                                Mapa de rutas activas
                            </Badge>
                            <CardTitle>Mapa cicloturístico</CardTitle>
                            <CardDescription>
                                Visualiza trazados, inicio, final, POIs
                                vinculados, incidencias en revisión y tu
                                ubicación si concedes permiso GPS.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RouteMap routes={routes.data} />
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {routes.data.map((route) => (
                        <Card key={route.id}>
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
                                        <Badge variant="outline">
                                            v{route.route_version}
                                        </Badge>
                                    </div>
                                    <CardTitle>{route.name}</CardTitle>
                                    <CardDescription>
                                        {route.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <MapPinned />
                                    <span>
                                        {route.start_name} → {route.end_name}
                                    </span>
                                </div>
                                {route.metric && (
                                    <>
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
                                    </>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" asChild>
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

RoutesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: '/routes',
        },
    ],
};
