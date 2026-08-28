import { Form, Head, router } from '@inertiajs/react';
import { EllipsisVertical, Pencil, Power, RouteIcon } from 'lucide-react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { CatalogOption } from '@/types';
import PoiForm from './partials/poi-form';

type ManagedPoi = {
    active: boolean;
    category: CatalogOption | null;
    deleted_at: string | null;
    description: string;
    id: number;
    name: string;
    reports_count: number;
    routes: { id: number; name: string; slug: string }[];
    routes_count: number;
};

type PaginatedPois = {
    current_page: number;
    data: ManagedPoi[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type PoiFilters = {
    category: string;
    per_page: number;
    search: string;
    status: string;
};

type PoiFormOptions = Omit<
    Parameters<typeof PoiForm>[0],
    'mode' | 'onCancel' | 'poi'
>;

type Props = {
    categories: CatalogOption[];
    filters: PoiFilters;
    form: 'create' | 'edit' | null;
    formOptions: PoiFormOptions | null;
    poiForm: Parameters<typeof PoiForm>[0]['poi'] | null;
    pois: PaginatedPois;
};

export default function AdminPoisIndex({
    categories,
    filters,
    form,
    formOptions,
    poiForm,
    pois,
}: Props) {
    const changeQuery = (query: DataTableQuery) => {
        router.get(
            PoiController.index.url(),
            {
                ...compactPoiQuery(query),
                ...(form === 'edit' && poiForm
                    ? { form, poi: poiForm.id }
                    : form === 'create'
                      ? { form }
                      : {}),
            },
            {
                only: ['pois', 'filters'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const openPoiForm = (mode: 'create' | 'edit', poiId?: number) => {
        router.get(
            PoiController.index.url(),
            {
                ...compactPoiQuery(filters),
                form: mode,
                ...(mode === 'edit' && poiId ? { poi: poiId } : {}),
            },
            {
                only: ['form', 'formOptions'],
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const closePoiForm = () => {
        router.get(PoiController.index.url(), compactPoiQuery(filters), {
            only: ['form', 'formOptions'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedPoi>[] = [
        {
            id: 'poi',
            label: 'POI',
            hideable: false,
            cellClassName: 'max-w-sm whitespace-normal',
            cell: (poi) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                        {poi.name}
                    </span>
                    <span className="line-clamp-2 text-muted-foreground">
                        {poi.description || 'Sin descripción'}
                    </span>
                </div>
            ),
        },
        {
            id: 'category',
            label: 'Categoría',
            mobileCell: (poi) => poi.category?.name ?? 'Sin categoría',
            cell: (poi) =>
                poi.category ? (
                    <Badge variant="outline">{poi.category.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">Sin categoría</span>
                ),
        },
        {
            id: 'routes',
            label: 'Rutas',
            mobileCell: (poi) =>
                poi.routes.length > 0
                    ? poi.routes.map((route) => route.name).join(', ')
                    : 'Sin rutas asociadas',
            cellClassName: 'max-w-xs whitespace-normal',
            cell: (poi) =>
                poi.routes.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        <Badge variant="outline">
                            <RouteIcon data-icon="inline-start" />
                            {poi.routes_count} ruta
                            {poi.routes_count === 1 ? '' : 's'}
                        </Badge>
                        <span className="line-clamp-2 text-muted-foreground">
                            {poi.routes.map((route) => route.name).join(', ')}
                        </span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">
                        Sin rutas asociadas
                    </span>
                ),
        },
        {
            id: 'reports',
            label: 'Reportes',
            cell: (poi) => (
                <span className="text-muted-foreground tabular-nums">
                    {poi.reports_count}
                </span>
            ),
        },
        {
            id: 'status',
            label: 'Estado',
            cell: (poi) => (
                <Badge variant={poi.active ? 'default' : 'outline'}>
                    {poi.active ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-32 text-right',
            cellClassName: 'text-right',
            cell: (poi) => (
                <PoiRowActions
                    poi={poi}
                    onEdit={() => openPoiForm('edit', poi.id)}
                />
            ),
        },
    ];

    return (
        <>
            <Head title="POIs" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Puntos de interés"
                        description="Gestiona POIs oficiales, categorías, detalles y relación con rutas."
                    />
                    <PrimaryActionButton
                        label="Nuevo POI"
                        onClick={() => openPoiForm('create')}
                    />
                </div>

                <DataTable
                    data={pois.data}
                    columns={columns}
                    getRowId={(poi) => poi.id}
                    emptyMessage="No hay POIs que coincidan con los filtros seleccionados."
                    searchPlaceholder="Buscar por nombre, descripción o categoría"
                    query={filters}
                    onQueryChange={changeQuery}
                    filters={[
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
                            id: 'status',
                            label: 'Filtrar por estado',
                            placeholder: 'Todos los estados',
                            options: [
                                { label: 'Activos', value: 'active' },
                                { label: 'Inactivos', value: 'inactive' },
                            ],
                        },
                    ]}
                    pagination={{
                        currentPage: pois.current_page,
                        from: pois.from,
                        lastPage: pois.last_page,
                        perPage: pois.per_page,
                        to: pois.to,
                        total: pois.total,
                    }}
                />
            </div>

            <Sheet
                open={form !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closePoiForm();
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="top-1/2 right-auto bottom-auto left-1/2 h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-none -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:h-[calc(100dvh-4rem)] sm:w-[min(72rem,calc(100vw-4rem))] sm:max-w-[min(72rem,calc(100vw-4rem))]"
                >
                    <SheetHeader className="shrink-0 border-b bg-popover">
                        <SheetTitle>
                            {form === 'edit' && poiForm
                                ? `Editar ${poiForm.name}`
                                : 'Nuevo punto de interés'}
                        </SheetTitle>
                        <SheetDescription>
                            {form === 'edit'
                                ? 'Actualiza la información útil y su relación con las rutas.'
                                : 'Crea un POI oficial, su información útil y su relación con las rutas.'}
                        </SheetDescription>
                    </SheetHeader>

                    {formOptions && form && (form === 'create' || poiForm) && (
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="mx-auto w-full max-w-5xl px-5 py-5">
                                <PoiForm
                                    key={
                                        form === 'edit' && poiForm
                                            ? `edit-${poiForm.id}`
                                            : 'create'
                                    }
                                    mode={form}
                                    onCancel={closePoiForm}
                                    poi={
                                        form === 'edit'
                                            ? (poiForm ?? undefined)
                                            : undefined
                                    }
                                    {...formOptions}
                                />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

function compactPoiQuery(query: DataTableQuery): DataTableQuery {
    return Object.fromEntries(
        Object.entries(query).filter(([key, value]) => {
            if (value === undefined || value === '') {
                return false;
            }

            if (key === 'page' && Number(value) === 1) {
                return false;
            }

            return !(key === 'per_page' && Number(value) === 15);
        }),
    ) as DataTableQuery;
}

function PoiRowActions({
    poi,
    onEdit,
}: {
    poi: ManagedPoi;
    onEdit: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Acciones para ${poi.name}`}
                >
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={onEdit}>
                        <Pencil />
                        Editar POI
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {poi.active ? (
                    <Form
                        {...PoiController.destroy.form(poi.id)}
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
                                    Desactivar POI
                                </button>
                            </DropdownMenuItem>
                        )}
                    </Form>
                ) : (
                    <Form
                        {...PoiController.restore.form(poi.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <DropdownMenuItem asChild disabled={processing}>
                                <button type="submit" disabled={processing}>
                                    <Power />
                                    Activar POI
                                </button>
                            </DropdownMenuItem>
                        )}
                    </Form>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

AdminPoisIndex.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: PoiController.index(),
        },
    ],
};
