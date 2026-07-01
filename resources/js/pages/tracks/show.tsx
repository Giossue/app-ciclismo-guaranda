import { Head, Link } from '@inertiajs/react';
import { Download, MapPinned } from 'lucide-react';
import TrackController from '@/actions/App/Http/Controllers/Cyclist/TrackController';
import Heading from '@/components/heading';
import { MobileTabs } from '@/components/mobile-tabs';
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

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Resumen"
                        description={track.route?.name ?? 'Recorrido GPS'}
                    />
                    {track.route && (
                        <Button variant="outline" asChild>
                            <Link href={`/routes/${track.route.slug}`} prefetch>
                                Volver
                            </Link>
                        </Button>
                    )}
                </div>

                <MobileTabs
                    defaultValue="metrics"
                    items={[
                        {
                            value: 'metrics',
                            label: 'Métricas',
                            content: (
                                <MetricsCard track={track} summary={summary} />
                            ),
                        },
                        {
                            value: 'export',
                            label: 'Exportar',
                            content: <ExportCard trackId={track.id} />,
                        },
                        {
                            value: 'points',
                            label: 'Puntos',
                            badge: track.points.length,
                            content: <PointsCard points={track.points} />,
                        },
                    ]}
                />
            </div>
        </>
    );
}

function MetricsCard({
    track,
    summary,
}: {
    track: TrackDetail;
    summary: Record<string, number | string | boolean | null>;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap gap-2">
                    {track.status && (
                        <Badge variant="secondary">{track.status.name}</Badge>
                    )}
                    <Badge variant={track.is_valid ? 'secondary' : 'outline'}>
                        {track.is_valid ? 'Válido' : 'No habilita valoración'}
                    </Badge>
                </div>
                <CardTitle>Métricas finales</CardTitle>
                <CardDescription>
                    Un recorrido válido completa al menos el 90% de la ruta.
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
                    label="Restante"
                    value={`${Number(summary.distance_remaining_km ?? 0).toLocaleString()} km`}
                />
                <Metric
                    label="Desnivel +"
                    value={`${Number(summary.elevation_gain_m ?? 0).toLocaleString()} m`}
                />
                <Metric
                    label="Tiempo restante"
                    value={
                        summary.estimated_remaining_seconds === null
                            ? '--'
                            : formatDuration(
                                  Number(summary.estimated_remaining_seconds),
                              )
                    }
                />
            </CardContent>
        </Card>
    );
}

function ExportCard({ trackId }: { trackId: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Exportar recorrido</CardTitle>
                <CardDescription>
                    Descarga tus puntos registrados.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
                <Button asChild>
                    <a
                        href={TrackController.export.url(trackId, {
                            query: { format: 'gpx' },
                        })}
                    >
                        <Download data-icon="inline-start" />
                        GPX
                    </a>
                </Button>
                <Button variant="outline" asChild>
                    <a
                        href={TrackController.export.url(trackId, {
                            query: { format: 'geojson' },
                        })}
                    >
                        <Download data-icon="inline-start" />
                        GeoJSON
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}

function PointsCard({ points }: { points: TrackPoint[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Puntos registrados</CardTitle>
                <CardDescription>Últimos puntos del recorrido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
                {points.slice(-12).map((point) => (
                    <div
                        key={point.id}
                        className="flex flex-col gap-1 rounded-lg border p-3 text-sm text-muted-foreground"
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
                                {new Date(point.recorded_at).toLocaleString()}
                            </span>
                        )}
                        <span>
                            Velocidad:{' '}
                            {point.speed_kmh?.toLocaleString() ?? '--'} km/h ·
                            Precisión:{' '}
                            {point.accuracy_m?.toLocaleString() ?? '--'} m
                        </span>
                    </div>
                ))}
                {points.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No se registraron puntos GPS.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-3">
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
