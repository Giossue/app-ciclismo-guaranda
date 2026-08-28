import { Form, Head, Link, router } from '@inertiajs/react';
import {
    Bike,
    Clock,
    Ellipsis,
    MapPinned,
    Pencil,
    Plus,
    Power,
} from 'lucide-react';
import type { ReactNode } from 'react';
import RouteController from '@/actions/App/Http/Controllers/Admin/RouteController';
import { DataTableToolbar } from '@/components/data-table';
import type { DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import ImageWithFallback from '@/components/image-with-fallback';
import { PrimaryActionButton } from '@/components/primary-action-button';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { usePartialReload } from '@/hooks/use-partial-reload';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

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
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type RouteFormOptions = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    poiCategories: CatalogOption[];
    pois: Parameters<typeof RouteForm>[0]['pois'];
    defaults?: Parameters<typeof RouteForm>[0]['defaults'];
    defaultGeojson?: string | null;
};

type RouteFormData = NonNullable<Parameters<typeof RouteForm>[0]['route']>;

type RouteFilters = {
    category: string;
    difficulty: string;
    search: string;
    status: string;
};

type Props = {
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    filters: RouteFilters;
    statuses: CatalogOption[];
    form: 'create' | 'edit' | null;
    formOptions: RouteFormOptions | null;
    routeForm: RouteFormData | null;
    routes: PaginatedRoutes;
};

/** Abre la hoja apuntando la URL al formulario, sin recargar el listado. */
function openRouteForm(query: { form: 'create' | 'edit'; route?: number }) {
    router.get(RouteController.index.url(), query, {
        only: ['form', 'formOptions', 'routeForm'],
        preserveScroll: true,
        preserveState: true,
    });
}

export default function AdminRoutesIndex({
    categories,
    difficulties,
    filters,
    form,
    formOptions,
    routeForm,
    routes,
    statuses,
}: Props) {
    const loading = usePartialReload(['routes']);

    const changeQuery = (query: DataTableQuery) => {
        router.get(RouteController.index.url(), query, {
            only: ['routes', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeRouteForm = () => {
        router.get(
            RouteController.index.url(),
            {},
            {
                only: ['form', 'formOptions', 'routeForm'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Rutas" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Rutas oficiales"
                        description="Gestiona las rutas disponibles para ciclistas."
                    />
                    <PrimaryActionButton
                        label="Nueva ruta"
                        onClick={() => openRouteForm({ form: 'create' })}
                    />
                </div>

                {/* Misma superficie que la barra dentro de DataTable. */}
                <Card className="data-table">
                    <CardContent>
                        <DataTableToolbar
                            query={filters}
                            onQueryChange={changeQuery}
                            searchPlaceholder="Buscar por nombre, descripción u origen"
                            filters={[
                                {
                                    id: 'status',
                                    label: 'Filtrar por estado',
                                    placeholder: 'Todos los estados',
                                    options: statuses.map((status) => ({
                                        label: status.name,
                                        value: String(status.id),
                                    })),
                                },
                                {
                                    id: 'category',
                                    label: 'Filtrar por categoría',
                                    placeholder: 'Todas las categorías',
                                    options: categories.map((category) => ({
                                        label: category.name,
                                        value: String(category.id),
                                    })),
                                },
                                {
                                    id: 'difficulty',
                                    label: 'Filtrar por dificultad',
                                    placeholder: 'Todas las dificultades',
                                    options: difficulties.map((difficulty) => ({
                                        label: difficulty.name,
                                        value: String(difficulty.id),
                                    })),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>

                <div
                    className={cn(
                        'ueb-stagger grid gap-4 transition-opacity duration-200 md:grid-cols-2 lg:grid-cols-3',
                        loading && 'pointer-events-none opacity-60',
                    )}
                >
                    {routes.data.map((route) => (
                        <Card key={route.id} className="overflow-hidden">
                            <ImageWithFallback
                                src={mediaUrl(route.main_image_path)}
                                alt={`Vista de ${route.name}`}
                                className="h-36 w-full object-cover"
                                fallback={
                                    <div className="flex h-36 items-center justify-center bg-muted text-muted-foreground">
                                        <MapPinned aria-hidden="true" />
                                        <span className="sr-only">
                                            Esta ruta no tiene imagen principal
                                        </span>
                                    </div>
                                }
                            />
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
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
                                                <Badge variant="outline">
                                                    {route.difficulty.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="font-normal tracking-normal">
                                            {route.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {route.description}
                                        </CardDescription>
                                    </div>
                                    <RouteCardActions route={route} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 text-sm">
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <MapPinned />
                                    <span className="line-clamp-2">
                                        {route.start_name} → {route.end_name}
                                    </span>
                                </div>
                                {route.metric && (
                                    <div className="grid grid-cols-2 gap-3 border-t pt-4 text-muted-foreground">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs">
                                                Distancia
                                            </span>
                                            <span className="flex items-center gap-2 text-foreground">
                                                <Bike />
                                                {route.metric.distance_km.toLocaleString()}{' '}
                                                km
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs">
                                                Tiempo estimado
                                            </span>
                                            <span className="flex items-center gap-2 text-foreground">
                                                <Clock />
                                                {
                                                    route.metric
                                                        .estimated_time_minutes
                                                }{' '}
                                                min
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {route.metric?.transport_mode && (
                                    <p className="text-xs text-muted-foreground">
                                        Medio: {route.metric.transport_mode}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {routes.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay rutas que mostrar</CardTitle>
                            <CardDescription>
                                Ajusta la búsqueda y los filtros, o crea la
                                primera ruta oficial para activar la gestión
                                cicloturística de Guaranda Go.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                type="button"
                                onClick={() =>
                                    openRouteForm({ form: 'create' })
                                }
                            >
                                <Plus data-icon="inline-start" />
                                Crear ruta
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Mostrando {routes.from ?? 0}-{routes.to ?? 0} de{' '}
                        {routes.total} rutas.
                    </p>
                    {routes.last_page > 1 && (
                        <RoutePagination routes={routes} />
                    )}
                </div>
            </div>

            <Sheet
                open={form !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeRouteForm();
                    }
                }}
            >
                <SheetContent className="w-screen max-w-none overflow-hidden p-0 sm:max-w-none">
                    <SheetHeader className="shrink-0 border-b bg-popover">
                        <SheetTitle>
                            {form === 'edit' && routeForm
                                ? `Editar ${routeForm.name}`
                                : 'Nueva ruta oficial'}
                        </SheetTitle>
                        <SheetDescription>
                            {form === 'edit'
                                ? 'Ajusta trazado, portada, métricas y POIs; los cambios relevantes incrementan la versión.'
                                : 'Completa primero lo esencial. Los detalles complementarios se muestran solo cuando los necesites.'}
                        </SheetDescription>
                    </SheetHeader>

                    {formOptions && (
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="mx-auto w-full max-w-5xl px-5 py-5">
                                <RouteForm
                                    key={
                                        form === 'edit' && routeForm
                                            ? `edit-${routeForm.id}`
                                            : 'create'
                                    }
                                    mode={form === 'edit' ? 'edit' : 'create'}
                                    onCancel={closeRouteForm}
                                    route={
                                        form === 'edit'
                                            ? (routeForm ?? undefined)
                                            : undefined
                                    }
                                    statuses={formOptions.statuses}
                                    categories={formOptions.categories}
                                    difficulties={formOptions.difficulties}
                                    transportModes={formOptions.transportModes}
                                    poiCategories={formOptions.poiCategories}
                                    pois={formOptions.pois}
                                    defaults={formOptions.defaults}
                                    defaultGeojson={formOptions.defaultGeojson}
                                />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

function RoutePagination({ routes }: { routes: PaginatedRoutes }) {
    const pageLinks = routes.links.slice(1, -1);
    const previousUrl = routes.links[0]?.url ?? null;
    const nextUrl = routes.links.at(-1)?.url ?? null;

    return (
        <nav
            aria-label="Paginación de rutas"
            className="flex flex-wrap items-center gap-2"
        >
            <PaginationButton label="Página anterior" url={previousUrl}>
                Anterior
            </PaginationButton>
            {pageLinks.map((link) =>
                link.url === null ? (
                    <span
                        key={link.label}
                        className="px-2 text-muted-foreground"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <PaginationButton
                        key={link.label}
                        label={`Página ${link.label}`}
                        url={link.url}
                        active={link.active}
                    >
                        {link.label}
                    </PaginationButton>
                ),
            )}
            <PaginationButton label="Página siguiente" url={nextUrl}>
                Siguiente
            </PaginationButton>
        </nav>
    );
}

function PaginationButton({
    active = false,
    children,
    label,
    url,
}: {
    active?: boolean;
    children: ReactNode;
    label: string;
    url: string | null;
}) {
    if (url === null) {
        return (
            <Button type="button" variant="outline" size="sm" disabled>
                {children}
            </Button>
        );
    }

    return (
        <Button
            asChild
            type="button"
            variant={active ? 'secondary' : 'outline'}
            size="sm"
        >
            <Link href={url} preserveScroll aria-label={label}>
                {children}
            </Link>
        </Button>
    );
}

function RouteCardActions({ route }: { route: RouteSummary }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Acciones para ${route.name}`}
                >
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() =>
                            openRouteForm({ form: 'edit', route: route.id })
                        }
                    >
                        <Pencil />
                        Editar ruta
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                {route.status?.name !== 'Inactiva' && (
                    <>
                        <DropdownMenuSeparator />
                        <Form
                            {...RouteController.destroy.form(route.id)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <DropdownMenuItem
                                    asChild
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    <button type="submit" disabled={processing}>
                                        <Power />
                                        Inactivar ruta
                                    </button>
                                </DropdownMenuItem>
                            )}
                        </Form>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function statusVariant(status: string): 'default' | 'outline' {
    return status === 'Activa' ? 'default' : 'outline';
}

AdminRoutesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: RouteController.index.url(),
        },
    ],
};
