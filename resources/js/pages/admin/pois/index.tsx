import { Form, Head, Link } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Power, RouteIcon } from 'lucide-react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
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

type ManagedPoi = {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    active: boolean;
    deleted_at: string | null;
    category: CatalogOption | null;
    routes_count: number;
    reports_count: number;
    routes: { id: number; name: string; slug: string }[];
};

type PendingSuggestion = {
    id: number;
    name: string;
    description: string;
    status: string;
    category: CatalogOption | null;
    user: string | null;
};

type PendingReport = {
    id: number;
    report_type: string;
    description: string;
    status: string;
    poi: CatalogOption | null;
    user: string | null;
};

type PaginatedPois = {
    data: ManagedPoi[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    pois: PaginatedPois;
    pendingSuggestions: PendingSuggestion[];
    pendingReports: PendingReport[];
};

export default function AdminPoisIndex({
    pois,
    pendingSuggestions,
    pendingReports,
}: Props) {
    return (
        <>
            <Head title="POIs" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Puntos de interés"
                        description="Gestiona POIs oficiales, categorías, detalles y relación con rutas"
                    />
                    <Button asChild>
                        <Link href="/admin/pois/create" prefetch>
                            <Plus data-icon="inline-start" />
                            Nuevo POI
                        </Link>
                    </Button>
                </div>

                <section className="grid gap-4 lg:grid-cols-2">
                    <PendingCard
                        title="Sugerencias pendientes"
                        description="POIs enviados por ciclistas para revisión administrativa."
                        items={pendingSuggestions.map((suggestion) => ({
                            id: suggestion.id,
                            title: suggestion.name,
                            meta: `${suggestion.category?.name ?? 'sin categoría'} · ${suggestion.user ?? 'usuario'}`,
                            description: suggestion.description,
                        }))}
                    />
                    <PendingCard
                        title="Reportes pendientes"
                        description="Reportes de POIs cerrados o con datos incorrectos."
                        items={pendingReports.map((report) => ({
                            id: report.id,
                            title: report.poi?.name ?? 'POI',
                            meta: `${report.report_type} · ${report.user ?? 'usuario'}`,
                            description: report.description,
                        }))}
                    />
                </section>

                <div className="grid gap-4">
                    {pois.data.map((poi) => (
                        <Card key={poi.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={
                                                    poi.active
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                            >
                                                {poi.active
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </Badge>
                                            {poi.category && (
                                                <Badge variant="outline">
                                                    {poi.category.name}
                                                </Badge>
                                            )}
                                            <Badge variant="outline">
                                                {poi.routes_count} ruta
                                                {poi.routes_count === 1
                                                    ? ''
                                                    : 's'}
                                            </Badge>
                                            {poi.reports_count > 0 && (
                                                <Badge variant="destructive">
                                                    {poi.reports_count} reporte
                                                    {poi.reports_count === 1
                                                        ? ''
                                                        : 's'}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle>{poi.name}</CardTitle>
                                        <CardDescription>
                                            {poi.description ||
                                                'Sin descripción'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <MapPin />
                                    <span>
                                        {poi.latitude.toFixed(5)},{' '}
                                        {poi.longitude.toFixed(5)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RouteIcon />
                                    <span>
                                        {poi.routes.length > 0
                                            ? poi.routes
                                                  .map((route) => route.name)
                                                  .join(', ')
                                            : 'Sin rutas asociadas'}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/admin/pois/${poi.id}/edit`}
                                        prefetch
                                    >
                                        <Pencil data-icon="inline-start" />
                                        Editar
                                    </Link>
                                </Button>
                                {poi.active && (
                                    <Form
                                        {...PoiController.destroy.form(poi.id)}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                            >
                                                <Power data-icon="inline-start" />
                                                Desactivar
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {pois.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay POIs creados</CardTitle>
                            <CardDescription>
                                Crea el primer punto de interés oficial para
                                enriquecer las rutas cicloturísticas.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild>
                                <Link href="/admin/pois/create" prefetch>
                                    <Plus data-icon="inline-start" />
                                    Crear POI
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {pois.from ?? 0}-{pois.to ?? 0} de {pois.total}{' '}
                    POIs.
                </div>
            </div>
        </>
    );
}

function PendingCard({
    title,
    description,
    items,
}: {
    title: string;
    description: string;
    items: { id: number; title: string; meta: string; description: string }[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {items.map((item) => (
                    <div key={item.id} className="rounded-xl border p-3">
                        <div className="flex flex-col gap-1">
                            <strong>{item.title}</strong>
                            <span className="text-sm text-muted-foreground">
                                {item.meta}
                            </span>
                            <p className="text-sm text-muted-foreground">
                                {item.description || 'Sin descripción'}
                            </p>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No hay elementos pendientes.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

AdminPoisIndex.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: '/admin/pois',
        },
    ],
};
