import { Form, Head, Link } from '@inertiajs/react';
import { Bike, Clock, MapPinned, Pencil, Plus, Power } from 'lucide-react';
import RouteController from '@/actions/App/Http/Controllers/Admin/RouteController';
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
import type { CatalogOption } from '@/types';

type RouteSummary = {
    id: number;
    name: string;
    slug: string;
    description: string;
    start_name: string;
    end_name: string;
    main_image_path: string | null;
    route_version: number;
    status: CatalogOption | null;
    category: CatalogOption | null;
    difficulty: CatalogOption | null;
    admin: { id: number; name: string } | null;
    metric: {
        distance_km: number;
        estimated_time_minutes: number;
        transport_mode: string | null;
    } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedRoutes = {
    data: RouteSummary[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    routes: PaginatedRoutes;
};

export default function AdminRoutesIndex({ routes }: Props) {
    return (
        <>
            <Head title="Rutas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Rutas oficiales"
                        description="Crea, publica e inactiva rutas disponibles para ciclistas"
                    />
                    <Button asChild>
                        <Link href="/admin/routes/create" prefetch>
                            <Plus data-icon="inline-start" />
                            Nueva ruta
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {routes.data.map((route) => (
                        <Card key={route.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {route.status && (
                                                <Badge
                                                    variant={statusVariant(
                                                        route.status.name,
                                                    )}
                                                >
                                                    {route.status.name}
                                                </Badge>
                                            )}
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
                                            <Badge variant="outline">
                                                v{route.route_version}
                                            </Badge>
                                        </div>
                                        <CardTitle>{route.name}</CardTitle>
                                        <CardDescription>
                                            {route.description}
                                        </CardDescription>
                                    </div>
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
                            <CardFooter className="flex flex-wrap gap-2">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/admin/routes/${route.id}/edit`}
                                        prefetch
                                    >
                                        <Pencil data-icon="inline-start" />
                                        Editar
                                    </Link>
                                </Button>
                                {route.status?.name !== 'inactiva' && (
                                    <Form
                                        {...RouteController.destroy.form(
                                            route.id,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                            >
                                                <Power data-icon="inline-start" />
                                                Inactivar
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {routes.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay rutas creadas</CardTitle>
                            <CardDescription>
                                Crea la primera ruta oficial para activar la
                                gestión cicloturística de Guaranda Go.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild>
                                <Link href="/admin/routes/create" prefetch>
                                    <Plus data-icon="inline-start" />
                                    Crear ruta
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {routes.from ?? 0}–{routes.to ?? 0} de{' '}
                    {routes.total} rutas.
                </div>
            </div>
        </>
    );
}

function statusVariant(status: string) {
    if (status === 'activa') {
        return 'secondary';
    }

    if (status === 'inactiva') {
        return 'destructive';
    }

    return 'outline';
}

AdminRoutesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: '/admin/routes',
        },
    ],
};
