import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Bike,
    Download,
    Eye,
    Star,
    TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import StatisticsController from '@/actions/App/Http/Controllers/Admin/StatisticsController';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
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
import type { ChartConfig } from '@/components/ui/chart';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePartialReload } from '@/hooks/use-partial-reload';

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

type ActivityPoint = {
    date: string;
    label: string;
    views: number;
    downloads: number;
    tracks: number;
};

type RatingBucket = {
    rating: number;
    label: string;
    count: number;
};

type Props = {
    filters: { from: string | null; to: string | null };
    metrics: Metric[];
    activitySeries: ActivityPoint[];
    ratingsDistribution: RatingBucket[];
    topViewedRoutes: RankedRoute[];
    topDownloadedRoutes: RankedRoute[];
    topRatedRoutes: RankedRoute[];
    incidentsByStatus: IncidentStatusCount[];
};

const periodMetricKeys = [
    'route_views',
    'downloads',
    'completed_tracks',
    'incidents',
];

const periodMetricIcons = {
    route_views: Eye,
    downloads: Download,
    completed_tracks: Bike,
    incidents: TriangleAlert,
};

const activityConfig = {
    views: { label: 'Consultas', color: 'var(--chart-1)' },
    downloads: { label: 'Descargas', color: 'var(--chart-2)' },
    tracks: { label: 'Recorridos', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const rankingConfig = {
    value: { label: 'Total', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const ratingsConfig = {
    count: { label: 'Valoraciones', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const incidentPalette = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export default function AdminStatisticsIndex({
    filters,
    metrics,
    activitySeries,
    ratingsDistribution,
    topViewedRoutes,
    topDownloadedRoutes,
    topRatedRoutes,
    incidentsByStatus,
}: Props) {
    const loading = usePartialReload(['metrics']);
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const query = {
        from: from || undefined,
        to: to || undefined,
    };
    const periodMetrics = metrics.filter((metric) =>
        periodMetricKeys.includes(metric.key),
    );
    const hasActivity = activitySeries.some(
        (point) => point.views + point.downloads + point.tracks > 0,
    );
    const hasRatings = ratingsDistribution.some((bucket) => bucket.count > 0);
    const incidentsTotal = incidentsByStatus.reduce(
        (total, status) => total + status.count,
        0,
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(StatisticsController.index.url(), query, {
            only: [
                'metrics',
                'activitySeries',
                'ratingsDistribution',
                'topViewedRoutes',
                'topDownloadedRoutes',
                'topRatedRoutes',
                'incidentsByStatus',
                'filters',
            ],
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
                    className="ueb-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
                >
                    {loading
                        ? Array.from({ length: 4 }, (_, index) => (
                              <Card
                                  key={`metric-skeleton-${index}`}
                                  className="min-h-36 gap-3 p-5"
                              >
                                  <Skeleton className="h-3 w-1/2" />
                                  <Skeleton className="h-8 w-2/3" />
                                  <Skeleton className="mt-auto h-3 w-full" />
                              </Card>
                          ))
                        : periodMetrics.map((metric) => {
                              const Icon =
                                  periodMetricIcons[
                                      metric.key as keyof typeof periodMetricIcons
                                  ] ?? BarChart3;

                              return (
                                  <Card key={metric.key} className="min-h-36">
                                      <CardHeader className="gap-2">
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                              <Icon aria-hidden="true" />
                                              <span className="text-sm">
                                                  {metric.label}
                                              </span>
                                          </div>
                                          <p className="text-3xl leading-none tracking-[-0.04em] text-foreground tabular-nums">
                                              {formatNumber(metric.value)}
                                          </p>
                                      </CardHeader>
                                      <CardContent className="mt-auto">
                                          <p className="text-xs leading-relaxed text-muted-foreground">
                                              {metric.description}
                                          </p>
                                      </CardContent>
                                  </Card>
                              );
                          })}
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Evolución de la actividad</CardTitle>
                        <CardDescription>
                            Consultas, descargas offline y recorridos por día
                            {filters.from || filters.to
                                ? ' en el rango elegido.'
                                : ' en los últimos 30 días.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : hasActivity ? (
                            <ChartContainer
                                config={activityConfig}
                                className="aspect-auto h-64 w-full"
                            >
                                <AreaChart
                                    data={activitySeries}
                                    margin={{ left: 4, right: 8, top: 8 }}
                                >
                                    <defs>
                                        {Object.keys(activityConfig).map(
                                            (key) => (
                                                <linearGradient
                                                    key={key}
                                                    id={`fill-${key}`}
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor={`var(--color-${key})`}
                                                        stopOpacity={0.7}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor={`var(--color-${key})`}
                                                        stopOpacity={0.05}
                                                    />
                                                </linearGradient>
                                            ),
                                        )}
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={24}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                        allowDecimals={false}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    {Object.keys(activityConfig).map((key) => (
                                        <Area
                                            key={key}
                                            dataKey={key}
                                            type="monotone"
                                            stroke={`var(--color-${key})`}
                                            fill={`url(#fill-${key})`}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                            <EmptyState message="Todavía no hay actividad registrada en este período." />
                        )}
                    </CardContent>
                </Card>

                <section className="ueb-stagger grid gap-4 xl:grid-cols-2">
                    <RankingChart
                        loading={loading}
                        title="Rutas más consultadas"
                        description="Aperturas de detalle por ciclistas."
                        empty="Aún no hay consultas registradas."
                        rows={topViewedRoutes}
                        valueKey="views_count"
                    />
                    <RankingChart
                        loading={loading}
                        title="Rutas más descargadas"
                        description="Paquetes offline guardados para usar sin conexión."
                        empty="Aún no hay descargas offline."
                        rows={topDownloadedRoutes}
                        valueKey="downloads_count"
                    />
                </section>

                <section className="ueb-stagger grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución de valoraciones</CardTitle>
                            <CardDescription>
                                Cuántas estrellas dan los ciclistas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-56 w-full" />
                            ) : hasRatings ? (
                                <ChartContainer
                                    config={ratingsConfig}
                                    className="aspect-auto h-56 w-full"
                                >
                                    <BarChart
                                        data={ratingsDistribution}
                                        margin={{ left: 4, right: 8, top: 8 }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="rating"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) =>
                                                `${value}★`
                                            }
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            width={28}
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent labelKey="label" />
                                            }
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="var(--color-count)"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <EmptyState message="Aún no hay valoraciones en el rango." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Incidencias por estado</CardTitle>
                            <CardDescription>
                                Reparto de los reportes recibidos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="mx-auto aspect-square h-56 rounded-full" />
                            ) : incidentsTotal > 0 ? (
                                <ChartContainer
                                    config={incidentsConfig(incidentsByStatus)}
                                    className="mx-auto aspect-square h-56"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    nameKey="name"
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={incidentsByStatus}
                                            dataKey="count"
                                            nameKey="name"
                                            innerRadius="55%"
                                            strokeWidth={2}
                                        >
                                            {incidentsByStatus.map(
                                                (status, index) => (
                                                    <Cell
                                                        key={status.id}
                                                        fill={
                                                            incidentPalette[
                                                                index %
                                                                    incidentPalette.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                        />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <EmptyState message="Aún no hay incidencias en el rango." />
                            )}
                        </CardContent>
                        {incidentsTotal > 0 && (
                            <CardFooter className="text-sm text-muted-foreground">
                                {incidentsTotal} reporte
                                {incidentsTotal === 1 ? '' : 's'} en total.
                            </CardFooter>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mejor valoradas</CardTitle>
                            <CardDescription>
                                Promedio de valoraciones aprobadas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-40 w-full" />
                            ) : topRatedRoutes.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ruta</TableHead>
                                            <TableHead className="text-right">
                                                Promedio
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topRatedRoutes.map((route) => (
                                            <TableRow key={route.id}>
                                                <TableCell className="max-w-0">
                                                    <p className="truncate text-sm text-foreground">
                                                        {route.name}
                                                    </p>
                                                    {route.ratings_count ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                route.ratings_count
                                                            }{' '}
                                                            valoración
                                                            {route.ratings_count ===
                                                            1
                                                                ? ''
                                                                : 'es'}
                                                        </p>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline">
                                                        <Star data-icon="inline-start" />
                                                        {formatAverage(
                                                            route.average_rating,
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState message="Aún no hay valoraciones aprobadas." />
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

function RankingChart({
    description,
    empty,
    loading,
    rows,
    title,
    valueKey,
}: {
    description: string;
    empty: string;
    loading: boolean;
    rows: RankedRoute[];
    title: string;
    valueKey: 'views_count' | 'downloads_count';
}) {
    const data = rows
        .map((route) => ({
            name: route.name,
            value: Number(route[valueKey] ?? 0),
        }))
        .filter((row) => row.value > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : data.length > 0 ? (
                    <ChartContainer
                        config={rankingConfig}
                        className="aspect-auto h-64 w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={data}
                            layout="vertical"
                            margin={{ left: 4, right: 32 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" hide allowDecimals={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={140}
                                tickFormatter={(value: string) =>
                                    value.length > 22
                                        ? `${value.slice(0, 21)}…`
                                        : value
                                }
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="value"
                                fill="var(--color-value)"
                                radius={[0, 6, 6, 0]}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    className="fill-muted-foreground"
                                    fontSize={12}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <EmptyState message={empty} />
                )}
            </CardContent>
        </Card>
    );
}

function incidentsConfig(rows: IncidentStatusCount[]): ChartConfig {
    return Object.fromEntries(
        rows.map((status, index) => [
            status.name,
            {
                label: status.name,
                color: incidentPalette[index % incidentPalette.length],
            },
        ]),
    );
}

function formatNumber(value: number | string) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue)
        ? numericValue.toLocaleString('es-EC')
        : String(value);
}

function formatAverage(value: string | undefined) {
    return Number(value ?? 0).toLocaleString('es-EC', {
        maximumFractionDigits: 2,
    });
}

function EmptyState({ message }: { message: string }) {
    return (
        <Empty className="min-h-52 border">
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
