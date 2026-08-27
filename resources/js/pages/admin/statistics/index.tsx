import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Download, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
    const query = new URLSearchParams();

    if (from) {
        query.set('from', from);
    }

    if (to) {
        query.set('to', to);
    }

    const exportUrl = `/admin/statistics/export${query.toString() ? `?${query.toString()}` : ''}`;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/admin/statistics',
            { from: from || undefined, to: to || undefined },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Estadísticas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Estadísticas y reportes"
                        description="Métricas operativas de rutas, usuarios, descargas, recorridos, incidencias y valoraciones."
                    />
                    <Button variant="outline" asChild>
                        <a href={exportUrl}>
                            <Download data-icon="inline-start" />
                            Exportar CSV
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>
                            Limita métricas temporales por rango de fechas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <FieldGroup className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                                <Field>
                                    <FieldLabel htmlFor="from">
                                        Desde
                                    </FieldLabel>
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
                                <Button type="submit" className="sm:self-end">
                                    <Filter data-icon="inline-start" />
                                    Aplicar
                                </Button>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric) => (
                        <Card key={metric.key}>
                            <CardHeader>
                                <CardDescription>
                                    {metric.label}
                                </CardDescription>
                                <CardTitle className="text-3xl">
                                    {metric.value.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {metric.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <RankingCard
                        title="Rutas más consultadas"
                        description="Detalle de ruta abierto por ciclistas."
                        empty="Aún no hay consultas registradas."
                        rows={topViewedRoutes}
                        valueKey="views_count"
                        valueLabel="consultas"
                    />
                    <RankingCard
                        title="Rutas más descargadas"
                        description="Paquetes offline guardados por usuarios."
                        empty="Aún no hay descargas offline."
                        rows={topDownloadedRoutes}
                        valueKey="downloads_count"
                        valueLabel="descargas"
                    />
                    <RankingCard
                        title="Rutas mejor calificadas"
                        description="Promedio de valoraciones aprobadas."
                        empty="Aún no hay valoraciones aprobadas."
                        rows={topRatedRoutes}
                        valueKey="average_rating"
                        valueLabel="promedio"
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Incidencias por estado</CardTitle>
                            <CardDescription>
                                Distribución de reportes según revisión
                                administrativa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {incidentsByStatus.length > 0 && (
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
                                        {incidentsByStatus.map((status) => (
                                            <TableRow key={status.id}>
                                                <TableCell className="font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <TrendingUp />
                                                        {status.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="secondary">
                                                        {status.count}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {incidentsByStatus.length === 0 && (
                                <EmptyState message="Aún no hay incidencias en el rango." />
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

function RankingCard({
    title,
    description,
    empty,
    rows,
    valueKey,
    valueLabel,
}: {
    title: string;
    description: string;
    empty: string;
    rows: RankedRoute[];
    valueKey: keyof RankedRoute;
    valueLabel: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {rows.length > 0 && (
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
                                    <TableCell>
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Badge variant="outline">
                                                #{index + 1}
                                            </Badge>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/routes/${route.id}/edit`}
                                                    className="truncate font-medium text-link hover:text-link-hover hover:underline"
                                                >
                                                    {route.name}
                                                </Link>
                                                {route.status && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {route.status}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">
                                            {String(route[valueKey] ?? 0)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {rows.length === 0 && <EmptyState message={empty} />}
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Empty className="min-h-44">
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
            href: '/admin/statistics',
        },
    ],
};
