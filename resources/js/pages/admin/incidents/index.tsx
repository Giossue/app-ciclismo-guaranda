import { Form, Head, Link, router } from '@inertiajs/react';
import {
    EllipsisVertical,
    FileImage,
    MapPin,
    RouteIcon,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import IncidentController from '@/actions/App/Http/Controllers/Admin/IncidentController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { CatalogOption } from '@/types';

type ManagedIncident = {
    id: number;
    title: string;
    description: string;
    full_description: string;
    latitude: number;
    longitude: number;
    reported_at: string | null;
    resolved_at: string | null;
    admin_response: string | null;
    route: { id: number; name: string; slug: string } | null;
    type: CatalogOption | null;
    status: CatalogOption | null;
    user: { id: number; name: string; email: string } | null;
    files: {
        id: number;
        file_path: string;
        file_type: string;
        size_bytes: number | null;
    }[];
};

type PaginatedIncidents = {
    current_page: number;
    data: ManagedIncident[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type IncidentFilters = {
    per_page: number;
    search: string;
    status: string;
    type: string;
};

type Props = {
    filters: IncidentFilters;
    incidents: PaginatedIncidents;
    statuses: CatalogOption[];
    types: CatalogOption[];
};

export default function AdminIncidentsIndex({
    filters,
    incidents,
    statuses,
    types,
}: Props) {
    const changeQuery = (query: DataTableQuery) => {
        router.get(IncidentController.index.url(), query, {
            only: ['incidents', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedIncident>[] = [
        {
            id: 'incident',
            label: 'Incidencia',
            hideable: false,
            cellClassName: 'max-w-sm whitespace-normal',
            cell: (incident) => (
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium text-foreground">
                        {incident.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {incident.description}
                    </span>
                </div>
            ),
        },
        {
            id: 'route',
            label: 'Ruta',
            cell: (incident) =>
                incident.route ? (
                    <Link
                        href={`/routes/${incident.route.slug}`}
                        prefetch
                        className="text-link underline-offset-4 hover:underline"
                    >
                        {incident.route.name}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">Sin ruta</span>
                ),
        },
        {
            id: 'type',
            label: 'Tipo',
            mobileCell: (incident) => incident.type?.name ?? 'Sin tipo',
            cell: (incident) =>
                incident.type ? (
                    <Badge variant="outline">{incident.type.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">Sin tipo</span>
                ),
        },
        {
            id: 'status',
            label: 'Estado',
            cell: (incident) =>
                incident.status ? (
                    <Badge
                        variant={
                            incident.status.name === 'reportada'
                                ? 'default'
                                : 'outline'
                        }
                    >
                        {incident.status.name}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">Sin estado</span>
                ),
        },
        {
            id: 'reporter',
            label: 'Reportó',
            cell: (incident) => (
                <span className="text-muted-foreground">
                    {incident.user?.name ?? 'Usuario no disponible'}
                </span>
            ),
        },
        {
            id: 'reportedAt',
            label: 'Fecha',
            cell: (incident) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatDate(incident.reported_at)}
                </span>
            ),
        },
        {
            id: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-14 text-right',
            cellClassName: 'text-right',
            cell: (incident) => (
                <IncidentRowActions incident={incident} statuses={statuses} />
            ),
        },
    ];

    return (
        <>
            <Head title="Incidencias" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Incidencias"
                    description="Revisa reportes de ciclistas y valida cuáles se muestran como activas en las rutas."
                />

                <DataTable
                    data={incidents.data}
                    columns={columns}
                    getRowId={(incident) => incident.id}
                    emptyMessage="No hay incidencias que coincidan con los filtros seleccionados."
                    searchPlaceholder="Buscar por título, ruta o ciclista"
                    query={filters}
                    onQueryChange={changeQuery}
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
                            id: 'type',
                            label: 'Filtrar por tipo',
                            placeholder: 'Todos los tipos',
                            options: types.map((type) => ({
                                label: type.name,
                                value: String(type.id),
                            })),
                        },
                    ]}
                    pagination={{
                        currentPage: incidents.current_page,
                        from: incidents.from,
                        lastPage: incidents.last_page,
                        perPage: incidents.per_page,
                        to: incidents.to,
                        total: incidents.total,
                    }}
                />
            </div>
        </>
    );
}

function IncidentRowActions({
    incident,
    statuses,
}: {
    incident: ManagedIncident;
    statuses: CatalogOption[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para ${incident.title}`}
                    >
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setOpen(true)}>
                            <ShieldCheck />
                            Revisar incidencia
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{incident.title}</SheetTitle>
                        <SheetDescription>
                            Reportada por{' '}
                            {incident.user?.name ?? 'usuario no disponible'} el{' '}
                            {formatDate(incident.reported_at)}.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-5 px-5 pb-5">
                        <IncidentSummary incident={incident} />

                        <IncidentReviewForm
                            incident={incident}
                            statuses={statuses}
                            onSuccess={() => setOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

function IncidentSummary({ incident }: { incident: ManagedIncident }) {
    return (
        <section className="flex flex-col gap-3 rounded-[var(--radius-control)] border bg-muted/40 p-4">
            <div className="flex flex-wrap gap-2">
                {incident.status && <Badge>{incident.status.name}</Badge>}
                {incident.type && (
                    <Badge variant="outline">{incident.type.name}</Badge>
                )}
            </div>

            <p className="text-sm leading-relaxed text-foreground">
                {incident.full_description}
            </p>

            <dl className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin aria-hidden="true" />
                    <dt className="sr-only">Coordenadas</dt>
                    <dd className="tabular-nums">
                        {incident.latitude}, {incident.longitude}
                    </dd>
                </div>

                {incident.route && (
                    <div className="flex items-center gap-2">
                        <RouteIcon aria-hidden="true" />
                        <dt className="sr-only">Ruta</dt>
                        <dd className="min-w-0 truncate">
                            <Link
                                href={`/routes/${incident.route.slug}`}
                                prefetch
                                className="text-link underline-offset-4 hover:underline"
                            >
                                {incident.route.name}
                            </Link>
                        </dd>
                    </div>
                )}

                {incident.files.length > 0 && (
                    <div className="flex items-center gap-2">
                        <FileImage aria-hidden="true" />
                        <dt className="sr-only">Adjuntos</dt>
                        <dd>
                            {incident.files.length} archivo
                            {incident.files.length === 1 ? '' : 's'} adjunto
                            {incident.files.length === 1 ? '' : 's'}
                        </dd>
                    </div>
                )}
            </dl>
        </section>
    );
}

function IncidentReviewForm({
    incident,
    onSuccess,
    statuses,
}: {
    incident: ManagedIncident;
    onSuccess: () => void;
    statuses: CatalogOption[];
}) {
    return (
        <Form
            {...IncidentController.update.form(incident.id)}
            onSuccess={onSuccess}
            options={{ preserveScroll: true }}
            className="flex flex-col gap-5"
        >
            {({ errors, processing }) => (
                <>
                    <FieldGroup className="grid gap-4">
                        <Field
                            data-invalid={Boolean(errors.incident_status_id)}
                        >
                            <FieldLabel htmlFor={`status-${incident.id}`}>
                                Estado de revisión
                            </FieldLabel>
                            <Select
                                name="incident_status_id"
                                defaultValue={
                                    incident.status
                                        ? String(incident.status.id)
                                        : undefined
                                }
                                required
                            >
                                <SelectTrigger
                                    id={`status-${incident.id}`}
                                    aria-invalid={Boolean(
                                        errors.incident_status_id,
                                    )}
                                >
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {statuses.map((status) => (
                                            <SelectItem
                                                key={status.id}
                                                value={String(status.id)}
                                            >
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.incident_status_id} />
                        </Field>

                        <Field data-invalid={Boolean(errors.admin_response)}>
                            <FieldLabel htmlFor={`response-${incident.id}`}>
                                Respuesta administrativa
                            </FieldLabel>
                            <Textarea
                                id={`response-${incident.id}`}
                                name="admin_response"
                                defaultValue={incident.admin_response ?? ''}
                                placeholder="Acción tomada, recomendación o motivo de descarte"
                                aria-invalid={Boolean(errors.admin_response)}
                            />
                            <InputError message={errors.admin_response} />
                        </Field>
                    </FieldGroup>

                    <SheetFooter>
                        <Button type="submit" disabled={processing}>
                            Guardar revisión
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
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

AdminIncidentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Incidencias',
            href: '/admin/incidents',
        },
    ],
};
