import { Head, Link } from '@inertiajs/react';
import { Download, MapPinned } from 'lucide-react';
import TrackController from '@/actions/App/Http/Controllers/Cyclist/TrackController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ActiveTrack, CatalogOption } from '@/types';

type TrackPoint = {
    id: number;
    latitude: number;
    longitude: number;
    elevation_m: number | null;
    speed_kmh: number | null;
    accuracy_m: number | null;
    recorded_at: string | null;
};

type TrackDetail = ActiveTrack & {
    route: { id: number; name: string; slug: string } | null;
    status: CatalogOption | null;
    points: TrackPoint[];
};

type Props = {
    track: TrackDetail;
};

export default function TracksShow({ track }: Props) {
    const summary = track.summary as Record<
        string,
        number | string | boolean | null
    >;

    return (
        <>
            <Head title="Resumen de recorrido" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Resumen de recorrido"
                        description={track.route?.name ?? 'Recorrido GPS'}
                    />
                    {track.route && (
                        <Button variant="outline" asChild>
                            <Link href={`/routes/${track.route.slug}`} prefetch>
                                Volver a la ruta
                            </Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap gap-2">
                            {track.status && (
                                <Badge variant="secondary">
                                    {track.status.name}
                                </Badge>
                            )}
                            <Badge
                                variant={
                                    track.is_valid ? 'secondary' : 'outline'
                                }
                            >
                                {track.is_valid
                                    ? 'Recorrido válido'
                                    : 'No habilita valoración'}
                            </Badge>
                        </div>
                        <CardTitle>Métricas finales</CardTitle>
                        <CardDescription>
                            Un recorrido se considera válido cuando completa al
                            menos el 90% de la ruta oficial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric
                            label="Distancia"
                            value={`${track.distance_traveled_km.toLocaleString()} km`}
                        />
                        <Metric
                            label="Avance"
                            value={`${track.completion_percentage.toLocaleString()}%`}
                        />
                        <Metric
                            label="Tiempo"
                            value={formatDuration(track.total_time_seconds)}
                        />
                        <Metric
                            label="Puntos GPS"
                            value={String(track.gps_points_count)}
                        />
                        <Metric
                            label="Vel. promedio"
                            value={`${Number(summary.average_speed_kmh ?? 0).toLocaleString()} km/h`}
                        />
                        <Metric
                            label="Distancia restante"
                            value={`${Number(summary.distance_remaining_km ?? 0).toLocaleString()} km`}
                        />
                        <Metric
                            label="Desnivel +"
                            value={`${Number(summary.elevation_gain_m ?? 0).toLocaleString()} m`}
                        />
                        <Metric
                            label="Tiempo restante estimado"
                            value={
                                summary.estimated_remaining_seconds === null
                                    ? '--'
                                    : formatDuration(
                                          Number(
                                              summary.estimated_remaining_seconds,
                                          ),
                                      )
                            }
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Exportar recorrido</CardTitle>
                        <CardDescription>
                            Descarga los puntos registrados para análisis o
                            respaldo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button asChild>
                            <a
                                href={TrackController.export.url(track.id, {
                                    query: { format: 'gpx' },
                                })}
                            >
                                <Download data-icon="inline-start" />
                                GPX
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={TrackController.export.url(track.id, {
                                    query: { format: 'geojson' },
                                })}
                            >
                                <Download data-icon="inline-start" />
                                GeoJSON
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Puntos registrados</CardTitle>
                        <CardDescription>
                            Últimos puntos GPS almacenados para este recorrido.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        {track.points.slice(-12).map((point) => (
                            <div
                                key={point.id}
                                className="flex flex-col gap-1 rounded-xl border p-3 text-sm text-muted-foreground"
                            >
                                <div className="flex items-center gap-2 text-foreground">
                                    <MapPinned />
                                    <strong>
                                        {point.latitude.toFixed(5)},{' '}
                                        {point.longitude.toFixed(5)}
                                    </strong>
                                </div>
                                {point.recorded_at && (
                                    <span>
                                        {new Date(
                                            point.recorded_at,
                                        ).toLocaleString()}
                                    </span>
                                )}
                                <span>
                                    Velocidad:{' '}
                                    {point.speed_kmh?.toLocaleString() ?? '--'}{' '}
                                    km/h · Precisión:{' '}
                                    {point.accuracy_m?.toLocaleString() ?? '--'}{' '}
                                    m
                                </span>
                            </div>
                        ))}
                        {track.points.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No se registraron puntos GPS.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border p-3">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    );
}

function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes} min`;
    }

    return `${hours} h ${minutes} min`;
}

TracksShow.layout = {
    breadcrumbs: [
        {
            title: 'Recorrido',
            href: '/routes',
        },
    ],
};
