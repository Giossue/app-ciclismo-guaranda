import { Form, Head, Link, router } from '@inertiajs/react';
import { EllipsisVertical, MapPin, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import IncidentController from '@/actions/App/Http/Controllers/Admin/IncidentController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import ImageGallery from '@/components/image-gallery';
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
import { mediaUrl } from '@/lib/media';
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
                            Verifica el reporte y define en qué estado queda
                            para los ciclistas.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-5 px-5 pb-5">
                        <IncidentSummary incident={incident} />

                        <section className="flex flex-col gap-3 rounded-[var(--radius-control)] border bg-muted/40 p-4">
                            <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                                Revisión
                            </h3>
                            <IncidentReviewForm
                                incident={incident}
                                statuses={statuses}
                                onSuccess={() => setOpen(false)}
                            />
                        </section>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

function IncidentSummary({ incident }: { incident: ManagedIncident }) {
    const images = incident.files
        .filter((file) => file.file_type.startsWith('image'))
        .map((file, index) => ({
            src: mediaUrl(file.file_path),
            alt: `Evidencia ${index + 1} de ${incident.title}`,
        }));

    return (
        <div className="flex flex-col gap-5">
            {/* 1. Qué pasó */}
            <section className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {incident.status && <Badge>{incident.status.name}</Badge>}
                    {incident.type && (
                        <Badge variant="outline">{incident.type.name}</Badge>
                    )}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                    {incident.full_description}
                </p>
            </section>

            {/* 2. Dónde: lo primero que el admin necesita para verificar */}
            <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    Ubicación
                </h3>
                <dl className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                        <dt className="shrink-0 text-muted-foreground">Ruta</dt>
                        <dd className="min-w-0 text-right">
                            {incident.route ? (
                                <Link
                                    href={`/routes/${incident.route.slug}`}
                                    prefetch
                                    className="text-link underline-offset-4 hover:underline"
                                >
                                    {incident.route.name}
                                </Link>
                            ) : (
                                <span className="text-muted-foreground">
                                    Sin ruta asociada
                                </span>
                            )}
                        </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                        <dt className="shrink-0 text-muted-foreground">
                            Coordenadas
                        </dt>
                        <dd className="min-w-0 text-right">
                            <a
                                href={`https://www.openstreetmap.org/?mlat=${incident.latitude}&mlon=${incident.longitude}#map=17/${incident.latitude}/${incident.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                data-selectable
                                className="inline-flex items-center gap-1 text-link tabular-nums underline-offset-4 hover:underline"
                            >
                                <MapPin aria-hidden="true" />
                                {incident.latitude}, {incident.longitude}
                            </a>
                        </dd>
                    </div>
                </dl>
            </section>

            {/* 3. Evidencia: se muestra, no se cuenta */}
            <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    Evidencia
                </h3>
                {images.length > 0 ? (
                    <ImageGallery
                        images={images}
                        variant="thumbnails"
                        thumbnailClassName="h-28 w-28"
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        El ciclista no adjuntó imágenes.
                    </p>
                )}
            </section>

            {/* 4. Quién y cuándo */}
            <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    Reporte
                </h3>
                <dl className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                        <dt className="shrink-0 text-muted-foreground">
                            Ciclista
                        </dt>
                        <dd
                            className="min-w-0 truncate text-right"
                            data-selectable
                        >
                            {incident.user?.name ?? 'Usuario no disponible'}
                        </dd>
                    </div>
                    {incident.user?.email && (
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="shrink-0 text-muted-foreground">
                                Correo
                            </dt>
                            <dd
                                className="min-w-0 truncate text-right"
                                data-selectable
                            >
                                {incident.user.email}
                            </dd>
                        </div>
                    )}
                    <div className="flex items-baseline justify-between gap-4">
                        <dt className="shrink-0 text-muted-foreground">
                            Reportada
                        </dt>
                        <dd className="text-right tabular-nums">
                            {formatDate(incident.reported_at)}
                        </dd>
                    </div>
                    {incident.resolved_at && (
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="shrink-0 text-muted-foreground">
                                Resuelta
                            </dt>
                            <dd className="text-right tabular-nums">
                                {formatDate(incident.resolved_at)}
                            </dd>
                        </div>
                    )}
                </dl>
            </section>
        </div>
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
            className="flex flex-col gap-4"
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
