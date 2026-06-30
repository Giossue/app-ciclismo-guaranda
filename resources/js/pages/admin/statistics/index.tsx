import { Head, Link, router } from '@inertiajs/react';
import { Download, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
                        <form
                            onSubmit={submit}
                            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="from">Desde</Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(event) =>
                                        setFrom(event.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="to">Hasta</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(event) =>
                                        setTo(event.target.value)
                                    }
                                />
                            </div>
                            <Button type="submit">
                                <Filter data-icon="inline-start" />
                                Aplicar
                            </Button>
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
                        <CardContent className="grid gap-3">
                            {incidentsByStatus.map((status) => (
                                <div
                                    key={status.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="size-4" />
                                        <span className="font-medium">
                                            {status.name}
                                        </span>
                                    </div>
                                    <Badge variant="secondary">
                                        {status.count}
                                    </Badge>
                                </div>
                            ))}
                            {incidentsByStatus.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Aún no hay incidencias en el rango.
                                </p>
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
            <CardContent className="grid gap-3">
                {rows.map((route, index) => (
                    <div
                        key={route.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                    >
                        <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <Link
                                    href={`/admin/routes/${route.id}/edit`}
                                    className="font-medium hover:underline"
                                >
                                    {route.name}
                                </Link>
                            </div>
                            {route.status && (
                                <p className="text-xs text-muted-foreground">
                                    Estado: {route.status}
                                </p>
                            )}
                        </div>
                        <Badge variant="secondary">
                            {String(route[valueKey] ?? 0)} {valueLabel}
                        </Badge>
                    </div>
                ))}
                {rows.length === 0 && (
                    <p className="text-sm text-muted-foreground">{empty}</p>
                )}
            </CardContent>
        </Card>
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
