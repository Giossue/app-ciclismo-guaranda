import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bike,
    ChartNoAxesCombined,
    Download,
    Eye,
    MapPin,
    MessageSquareText,
    Route,
    Users,
} from 'lucide-react';
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
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as incidentsIndex } from '@/routes/admin/incidents';
import { index as poisIndex } from '@/routes/admin/pois';
import { index as ratingsIndex } from '@/routes/admin/ratings';
import { index as routesIndex } from '@/routes/admin/routes';
import { index as statisticsIndex } from '@/routes/admin/statistics';
import { index as usersIndex } from '@/routes/admin/users';

type OverviewKey =
    | 'users'
    | 'activeUsers'
    | 'activeRoutes'
    | 'pois'
    | 'routeViews'
    | 'downloads';

type OverviewMetric = {
    key: OverviewKey;
    label: string;
    value: number;
    description: string;
};

type DayActivity = {
    label: string;
    views: number;
    downloads: number;
};

type RouteStatus = {
    id: number;
    name: string;
    count: number;
};

type PopularRoute = {
    id: number;
    name: string;
    status: string | null;
    views: number;
    downloads: number;
};

type AttentionItem = {
    key: 'incidents' | 'ratings';
    label: string;
    value: number;
    description: string;
    tone: 'warning' | 'default';
};

type RecentIncident = {
    id: number;
    title: string;
    reportedAt: string | null;
    status: string | null;
    route: { id: number; name: string } | null;
    reporter: { id: number; name: string } | null;
};

type Props = {
    overview: OverviewMetric[];
    activity: {
        period: string;
        newUsers: number;
        completedTracks: number;
        routeViews: number;
        downloads: number;
        days: DayActivity[];
    };
    routeStatuses: RouteStatus[];
    popularRoutes: PopularRoute[];
    attention: AttentionItem[];
    recentIncidents: RecentIncident[];
};

const overviewIcons = {
    users: Users,
    activeUsers: Bike,
    activeRoutes: Route,
    pois: MapPin,
    routeViews: Eye,
    downloads: Download,
} as const;

const overviewDestinations = {
    users: usersIndex,
    activeUsers: usersIndex,
    activeRoutes: routesIndex,
    pois: poisIndex,
    routeViews: statisticsIndex,
    downloads: statisticsIndex,
} as const;

const attentionDestinations = {
    incidents: incidentsIndex,
    ratings: ratingsIndex,
} as const;

export default function AdminDashboard({
    overview,
    activity,
    routeStatuses,
    popularRoutes,
    attention,
    recentIncidents,
}: Props) {
    const totalRoutes = routeStatuses.reduce(
        (total, status) => total + status.count,
        0,
    );

    return (
        <>
            <Head title="Resumen" />

            <div className="flex flex-col gap-4 md:gap-6">
                <Heading
                    title="Resumen operativo"
                    description="Actividad reciente, contenido publicado y tareas que requieren revisión."
                />

                <section
                    aria-label="Indicadores principales"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"
                >
                    {overview.map((metric) => (
                        <OverviewCard key={metric.key} metric={metric} />
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-5">
                    <ActivityCard activity={activity} />
                    <PopularRoutesCard routes={popularRoutes} />
                </section>

                <section className="grid gap-4 xl:grid-cols-5">
                    <RouteStatusCard
                        statuses={routeStatuses}
                        totalRoutes={totalRoutes}
                    />
                    <AttentionCard attention={attention} />
                </section>

                <RecentIncidentsCard incidents={recentIncidents} />
            </div>
        </>
    );
}

function OverviewCard({ metric }: { metric: OverviewMetric }) {
    const Icon = overviewIcons[metric.key];
    const destination = overviewDestinations[metric.key];

    return (
        <Link href={destination()} prefetch className="group min-w-0">
            <Card className="h-full min-h-52 transition-colors group-hover:border-primary">
                <CardHeader className="gap-3">
                    <CardTitle className="text-base tracking-[-0.02em]">
                        {metric.label}
                    </CardTitle>
                    <Icon
                        aria-hidden="true"
                        className="size-5 text-muted-foreground"
                    />
                    <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <p className="text-3xl leading-none font-medium tracking-tight tabular-nums">
                        {metric.value.toLocaleString()}
                    </p>
                </CardContent>
                <CardFooter className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    Ver detalle
                    <ArrowRight aria-hidden="true" className="size-4" />
                </CardFooter>
            </Card>
        </Link>
    );
}

function ActivityCard({ activity }: { activity: Props['activity'] }) {
    return (
        <Card className="xl:col-span-3">
            <CardHeader>
                <CardTitle>Actividad de rutas</CardTitle>
                <CardDescription>{activity.period}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary" />
                        Consultas de rutas
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-foreground/35" />
                        Descargas offline
                    </span>
                </div>
                <ActivityBars days={activity.days} />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ActivityMetric
                        label="Consultas"
                        value={activity.routeViews}
                        icon={Eye}
                    />
                    <ActivityMetric
                        label="Descargas"
                        value={activity.downloads}
                        icon={Download}
                    />
                    <ActivityMetric
                        label="Recorridos finalizados"
                        value={activity.completedTracks}
                        icon={Route}
                    />
                    <ActivityMetric
                        label="Nuevos usuarios"
                        value={activity.newUsers}
                        icon={Users}
                    />
                </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                Las consultas y descargas se contabilizan desde los eventos de
                la aplicación.
            </CardFooter>
        </Card>
    );
}

function ActivityBars({ days }: { days: DayActivity[] }) {
    const maximum = Math.max(
        1,
        ...days.flatMap(({ views, downloads }) => [views, downloads]),
    );

    return (
        <div
            className="flex h-40 items-end gap-2"
            role="img"
            aria-label="Consultas y descargas de rutas de los últimos siete días"
        >
            {days.map((day) => (
                <div
                    key={day.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                    <div className="flex h-28 w-full items-end justify-center gap-1 rounded-[var(--radius-control)] bg-muted p-1">
                        <div
                            className="min-h-1 w-full rounded-[var(--radius-tight)] bg-primary"
                            style={{
                                height: `${(day.views / maximum) * 100}%`,
                            }}
                            title={`${day.views} consultas`}
                        />
                        <div
                            className="min-h-1 w-full rounded-[var(--radius-tight)] bg-foreground/35"
                            style={{
                                height: `${(day.downloads / maximum) * 100}%`,
                            }}
                            title={`${day.downloads} descargas`}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {day.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ActivityMetric({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Eye;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2 rounded-[var(--radius-control)] border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
                <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-lg leading-none font-medium tabular-nums">
                {value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
                Últimos 7 días
            </span>
        </div>
    );
}

function PopularRoutesCard({ routes }: { routes: PopularRoute[] }) {
    const maximumViews = Math.max(1, ...routes.map((route) => route.views));

    return (
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Rutas con más actividad</CardTitle>
                <CardDescription>
                    Consultas y descargas de los últimos 30 días.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {routes.length === 0 ? (
                    <Empty className="min-h-52 p-6">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ChartNoAxesCombined />
                            </EmptyMedia>
                            <EmptyTitle>Aún no hay rutas</EmptyTitle>
                            <EmptyDescription>
                                Cuando se publiquen rutas y exista actividad,
                                aparecerán aquí.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {routes.map((route) => (
                            <li key={route.id} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {route.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {route.downloads.toLocaleString()}{' '}
                                            descargas
                                        </p>
                                    </div>
                                    {route.status && (
                                        <Badge variant="outline">
                                            {route.status}
                                        </Badge>
                                    )}
                                </div>
                                <ProgressBar
                                    value={route.views}
                                    maximum={maximumViews}
                                    label={`${route.name}: ${route.views} consultas`}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" size="sm" asChild>
                    <Link href={routesIndex()} prefetch>
                        Ver rutas
                        <ArrowRight data-icon="inline-end" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function RouteStatusCard({
    statuses,
    totalRoutes,
}: {
    statuses: RouteStatus[];
    totalRoutes: number;
}) {
    return (
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Estado del contenido</CardTitle>
                <CardDescription>
                    Distribución de las rutas registradas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {statuses.length === 0 ? (
                    <Empty className="min-h-40 p-6">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Route />
                            </EmptyMedia>
                            <EmptyTitle>Sin estados configurados</EmptyTitle>
                            <EmptyDescription>
                                Configura los catálogos de rutas para ver esta
                                distribución.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {statuses.map((status) => (
                            <li key={status.id} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-medium">
                                        {status.name}
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {status.count.toLocaleString()}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={status.count}
                                    maximum={totalRoutes}
                                    label={`${status.name}: ${status.count} rutas`}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                {totalRoutes.toLocaleString()} rutas en total.
            </CardFooter>
        </Card>
    );
}

function AttentionCard({ attention }: { attention: AttentionItem[] }) {
    return (
        <Card className="xl:col-span-3">
            <CardHeader>
                <CardTitle>Requiere atención</CardTitle>
                <CardDescription>
                    Revisa primero los reportes y comentarios pendientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="flex flex-col gap-3">
                    {attention.map((item) => {
                        const destination = attentionDestinations[item.key];

                        return (
                            <li key={item.key}>
                                <Link
                                    href={destination()}
                                    prefetch
                                    className="group flex items-center gap-3 rounded-[var(--radius-control)] border p-3 transition-colors hover:border-primary hover:bg-muted"
                                >
                                    {item.key === 'incidents' ? (
                                        <AlertTriangle
                                            aria-hidden="true"
                                            className="size-5 shrink-0 text-muted-foreground"
                                        />
                                    ) : (
                                        <MessageSquareText
                                            aria-hidden="true"
                                            className="size-5 shrink-0 text-muted-foreground"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            item.tone === 'warning'
                                                ? 'warning'
                                                : 'outline'
                                        }
                                    >
                                        {item.value.toLocaleString()}
                                    </Badge>
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-4 shrink-0 text-muted-foreground"
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}

function RecentIncidentsCard({ incidents }: { incidents: RecentIncident[] }) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>Incidencias recientes</CardTitle>
                    <CardDescription>
                        Últimos reportes enviados por ciclistas.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={incidentsIndex()} prefetch>
                        Ver incidencias
                        <ArrowRight data-icon="inline-end" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {incidents.length === 0 ? (
                    <Empty className="min-h-52">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <AlertTriangle />
                            </EmptyMedia>
                            <EmptyTitle>Sin incidencias recientes</EmptyTitle>
                            <EmptyDescription>
                                Los nuevos reportes aparecerán aquí para su
                                revisión.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="overflow-x-auto rounded-[var(--radius-control)] border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Incidencia</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Ruta
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        Reportó
                                    </TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">
                                        Fecha
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incidents.map((incident) => (
                                    <TableRow key={incident.id}>
                                        <TableCell className="max-w-56 truncate font-medium">
                                            {incident.title}
                                        </TableCell>
                                        <TableCell className="hidden max-w-48 truncate text-muted-foreground md:table-cell">
                                            {incident.route?.name ?? 'Sin ruta'}
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                                            {incident.reporter?.name ??
                                                'Usuario no disponible'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={incident.status}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatDate(incident.reportedAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ProgressBar({
    value,
    maximum,
    label,
}: {
    value: number;
    maximum: number;
    label: string;
}) {
    const percentage = maximum === 0 ? 0 : Math.round((value / maximum) * 100);

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={maximum}
            aria-valuenow={value}
            className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-muted"
        >
            <div
                className="h-full rounded-[var(--radius-pill)] bg-primary transition-[width]"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    const normalizedStatus = status?.toLocaleLowerCase('es-EC');
    const variant =
        normalizedStatus === 'resuelta'
            ? 'success'
            : normalizedStatus === 'en revisión'
              ? 'warning'
              : 'outline';

    return <Badge variant={variant}>{status ?? 'Sin estado'}</Badge>;
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Resumen', href: '/admin/dashboard' }],
};
