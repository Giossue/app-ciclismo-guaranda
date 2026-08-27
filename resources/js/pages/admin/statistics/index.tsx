import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    Eye,
    Flag,
    Route,
    Star,
    TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import StatisticsController from '@/actions/App/Http/Controllers/Admin/StatisticsController';
import { DatePicker } from '@/components/date-picker';
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
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Metric = {
    key: string;
    label: string;
    value: number | string;
    description: string;
};

type RankedRoute = {
    id: number;
    name: string;
    status?: string | null;
    views_count?: number;
    downloads_count?: number;
    average_rating?: string;
    ratings_count?: number;
};

type IncidentStatusCount = {
    id: number;
    name: string;
    count: number;
};

type Props = {
    filters: {
        from: string | null;
        to: string | null;
    };
    metrics: Metric[];
    topViewedRoutes: RankedRoute[];
    topDownloadedRoutes: RankedRoute[];
    topRatedRoutes: RankedRoute[];
    incidentsByStatus: IncidentStatusCount[];
};

const periodMetricIcons = {
    route_views: Eye,
    downloads: Download,
    completed_tracks: Route,
    incidents: TriangleAlert,
};

const periodMetricKeys = Object.keys(periodMetricIcons);

export default function AdminStatisticsIndex({
    filters,
    metrics,
    topViewedRoutes,
    topDownloadedRoutes,
    topRatedRoutes,
    incidentsByStatus,
}: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const query = {
        from: from || undefined,
        to: to || undefined,
    };
    const periodMetrics = metrics.filter((metric) =>
        periodMetricKeys.includes(metric.key),
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(StatisticsController.index.url(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Estadísticas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <Heading
                        title="Análisis operativo"
                        description="Uso, actividad offline y calidad de las rutas en el período seleccionado."
                    />

                    <form onSubmit={submit} className="w-full xl:w-auto">
                        <FieldGroup className="grid gap-3 sm:grid-cols-3 sm:items-end">
                            <Field>
                                <FieldLabel htmlFor="from">Desde</FieldLabel>
                                <DatePicker
                                    id="from"
                                    value={from}
                                    onChange={setFrom}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="to">Hasta</FieldLabel>
                                <DatePicker
                                    id="to"
                                    value={to}
                                    onChange={setTo}
                                />
                            </Field>
                            <div className="flex gap-2 sm:pb-px">
                                <Button type="submit" className="flex-1">
                                    <BarChart3 data-icon="inline-start" />
                                    Actualizar
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                    <a
                                        href={StatisticsController.export.url({
                                            query,
                                        })}
                                        aria-label="Exportar estadísticas en CSV"
                                    >
                                        <Download />
                                    </a>
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </div>

                <section
                    aria-label="Resumen del período"
                    className="grid overflow-hidden rounded-[var(--radius-surface)] border bg-card sm:grid-cols-2 xl:grid-cols-4"
                >
                    {periodMetrics.map((metric) => {
                        const Icon =
                            periodMetricIcons[
                                metric.key as keyof typeof periodMetricIcons
                            ] ?? BarChart3;

                        return (
                            <article
                                key={metric.key}
                                className="flex min-h-40 flex-col gap-4 border-b p-5 last:border-b-0 sm:nth-[2n]:border-l sm:nth-[2n]:border-l-border xl:border-b-0 xl:border-l xl:first:border-l-0"
                            >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Icon />
                                    <span className="text-sm">
                                        {metric.label}
                                    </span>
                                </div>
                                <p className="text-3xl leading-none tracking-[-0.04em] text-foreground">
                                    {formatNumber(metric.value)}
                                </p>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {metric.description}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Uso de rutas</CardTitle>
                            <CardDescription>
                                Las rutas con más actividad dentro del período
                                elegido.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 lg:grid-cols-2">
                            <RankingTable
                                title="Más consultadas"
                                description="Aperturas de detalle por ciclistas."
                                empty="Aún no hay consultas registradas."
                                rows={topViewedRoutes}
                                valueKey="views_count"
                                valueLabel="Consultas"
                            />
                            <RankingTable
                                title="Más descargadas"
                                description="Paquetes offline guardados."
                                empty="Aún no hay descargas offline."
                                rows={topDownloadedRoutes}
                                valueKey="downloads_count"
                                valueLabel="Descargas"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calidad y seguridad</CardTitle>
                            <CardDescription>
                                Valoraciones aprobadas e incidencias a revisar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <RankingTable
                                title="Mejor valoradas"
                                description="Promedio de valoraciones aprobadas."
                                empty="Aún no hay valoraciones aprobadas."
                                rows={topRatedRoutes}
                                valueKey="average_rating"
                                valueLabel="Promedio"
                                compact
                            />

                            <IncidentBreakdown rows={incidentsByStatus} />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

function RankingTable({
    title,
    description,
    empty,
    rows,
    valueKey,
    valueLabel,
    compact = false,
}: {
    title: string;
    description: string;
    empty: string;
    rows: RankedRoute[];
    valueKey: keyof RankedRoute;
    valueLabel: string;
    compact?: boolean;
}) {
    return (
        <section className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {rows.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ruta</TableHead>
                            <TableHead className="text-right">
                                {valueLabel}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((route, index) => (
                            <TableRow key={route.id}>
                                <TableCell className="max-w-0">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm text-foreground">
                                                {route.name}
                                            </p>
                                            {route.status ? (
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {route.status}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm text-foreground">
                                    {formatRouteValue(route, valueKey, compact)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState message={empty} />
            )}
        </section>
    );
}

function IncidentBreakdown({ rows }: { rows: IncidentStatusCount[] }) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm text-foreground">Incidencias</h3>
                <p className="text-sm text-muted-foreground">
                    Distribución de reportes por estado.
                </p>
            </div>

            {rows.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">
                                Reportes
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((status) => (
                            <TableRow key={status.id}>
                                <TableCell>
                                    <span className="flex items-center gap-2 text-sm text-foreground">
                                        <Flag />
                                        {status.name}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline">
                                        {status.count}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState message="Aún no hay incidencias en el rango." />
            )}
        </section>
    );
}

function formatNumber(value: number | string) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue)
        ? numericValue.toLocaleString('es-EC')
        : String(value);
}

function formatRouteValue(
    route: RankedRoute,
    valueKey: keyof RankedRoute,
    compact: boolean,
) {
    if (valueKey === 'average_rating') {
        const average = Number(route.average_rating ?? 0).toLocaleString(
            'es-EC',
            {
                maximumFractionDigits: 2,
            },
        );

        return (
            <span className="inline-flex items-center gap-1">
                <Star />
                {average}
                {!compact && route.ratings_count
                    ? ` (${route.ratings_count})`
                    : null}
            </span>
        );
    }

    return formatNumber(route[valueKey] as number | string);
}

function EmptyState({ message }: { message: string }) {
    return (
        <Empty className="min-h-36 border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BarChart3 />
                </EmptyMedia>
                <EmptyTitle>Sin datos disponibles</EmptyTitle>
                <EmptyDescription>{message}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

AdminStatisticsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Estadísticas',
            href: StatisticsController.index.url(),
        },
    ],
};
