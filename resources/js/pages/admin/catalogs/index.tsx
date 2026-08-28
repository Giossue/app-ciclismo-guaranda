import { Form, Head, router } from '@inertiajs/react';
import {
    Bike,
    ListTree,
    Map,
    MapPin,
    Pencil,
    Plus,
    ShieldAlert,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import CatalogController from '@/actions/App/Http/Controllers/Admin/CatalogController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

type CatalogSummary = {
    locked: boolean;
    slug: string;
    title: string;
};

type CatalogDomain = {
    catalogs: CatalogSummary[];
    description: string;
    slug: string;
    title: string;
};

type SelectedDomain = Omit<CatalogDomain, 'catalogs'>;

type CatalogMeta = {
    domain: string;
    has_active: boolean;
    has_description: boolean;
    locked: boolean;
    slug: string;
    title: string;
};

type CatalogRecord = {
    active?: boolean;
    description?: string | null;
    id: number;
    name: string;
};

type PaginatedRecords = {
    current_page: number;
    data: CatalogRecord[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type CatalogFilters = {
    catalog: string;
    domain: string;
    per_page: number;
    search: string;
    status: string;
};

type Props = {
    catalog: CatalogMeta;
    domain: SelectedDomain;
    domains: CatalogDomain[];
    filters: CatalogFilters;
    records: PaginatedRecords;
};

const domainIcons: Record<string, LucideIcon> = {
    users: UsersRound,
    routes: Map,
    pois: MapPin,
    tracks: Bike,
    incidents: ShieldAlert,
    system: ListTree,
};

export default function AdminCatalogsIndex({
    catalog,
    domain,
    domains,
    filters,
    records,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);

    const changeQuery = (query: DataTableQuery) => {
        router.get(
            CatalogController.index.url(),
            {
                ...query,
                domain: query.domain ?? domain.slug,
                catalog: query.catalog ?? catalog.slug,
            },
            {
                only: ['catalog', 'domain', 'domains', 'records', 'filters'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const selectCatalog = (slug: string) => {
        setCreateOpen(false);
        changeQuery({
            domain: domain.slug,
            catalog: slug,
            per_page: filters.per_page,
        });
    };

    const selectDomain = (slug: string) => {
        const selectedDomain = domains.find((option) => option.slug === slug);
        const firstCatalog = selectedDomain?.catalogs[0];

        if (!firstCatalog) {
            return;
        }

        setCreateOpen(false);
        changeQuery({
            domain: slug,
            catalog: firstCatalog.slug,
            per_page: filters.per_page,
        });
    };

    const columns: DataTableColumn<CatalogRecord>[] = [
        {
            id: 'name',
            label: 'Nombre',
            hideable: false,
            cell: (record) => (
                <span className="text-foreground">{record.name}</span>
            ),
        },
        ...(catalog.has_description
            ? [
                  {
                      id: 'description',
                      label: 'Descripción',
                      cell: (record: CatalogRecord) =>
                          record.description ? (
                              <span className="text-muted-foreground">
                                  {record.description}
                              </span>
                          ) : (
                              <span className="text-muted-foreground">
                                  Sin descripción
                              </span>
                          ),
                  },
              ]
            : []),
        ...(catalog.has_active
            ? [
                  {
                      id: 'status',
                      label: 'Estado',
                      cell: (record: CatalogRecord) => (
                          <Badge
                              variant={record.active ? 'default' : 'outline'}
                          >
                              {record.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                      ),
                  },
              ]
            : []),
        {
            id: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-14 text-right',
            cellClassName: 'text-right',
            cell: (record) => (
                <CatalogRecordRowActions catalog={catalog} record={record} />
            ),
        },
    ];

    return (
        <>
            <Head title="Catálogos" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Catálogos"
                    description="Administra los valores operativos que usa cada módulo de Guaranda Go."
                />

                <section className="overflow-hidden rounded-[var(--radius-surface)] border bg-card lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
                    <aside className="border-b bg-muted/20 lg:border-r lg:border-b-0">
                        <nav
                            aria-label="Módulos de catálogos"
                            className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
                        >
                            {domains.map((option) => {
                                const Icon =
                                    domainIcons[option.slug] ?? ListTree;
                                const selected = option.slug === domain.slug;

                                return (
                                    <Button
                                        key={option.slug}
                                        type="button"
                                        variant={
                                            selected ? 'secondary' : 'ghost'
                                        }
                                        className="h-auto min-w-max justify-start px-3 py-2 lg:w-full"
                                        aria-current={
                                            selected ? 'page' : undefined
                                        }
                                        onClick={() =>
                                            selectDomain(option.slug)
                                        }
                                    >
                                        <Icon data-icon="inline-start" />
                                        {option.title}
                                    </Button>
                                );
                            })}
                        </nav>

                        <nav
                            aria-label={`Catálogos de ${domain.title}`}
                            className="flex gap-1 overflow-x-auto border-t p-2 lg:flex-col lg:overflow-visible"
                        >
                            {domains
                                .find((option) => option.slug === domain.slug)
                                ?.catalogs.map((option) => {
                                    const selected =
                                        option.slug === catalog.slug;

                                    return (
                                        <Button
                                            key={option.slug}
                                            type="button"
                                            variant={
                                                selected ? 'outline' : 'ghost'
                                            }
                                            size="sm"
                                            className="h-auto min-w-max justify-start px-3 py-2 lg:w-full"
                                            aria-current={
                                                selected ? 'page' : undefined
                                            }
                                            onClick={() =>
                                                selectCatalog(option.slug)
                                            }
                                        >
                                            {option.title}
                                        </Button>
                                    );
                                })}
                        </nav>
                    </aside>

                    <div className="min-w-0">
                        <div className="flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl">{catalog.title}</h2>
                                    {catalog.locked && (
                                        <Badge variant="outline">
                                            Base del sistema
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {domain.description}
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setCreateOpen(true)}
                            >
                                <Plus data-icon="inline-start" />
                                Nuevo registro
                            </Button>
                        </div>

                        <div className="p-5">
                            <DataTable
                                data={records.data}
                                columns={columns}
                                getRowId={(record) => record.id}
                                emptyMessage="No hay registros que coincidan con los filtros seleccionados."
                                searchPlaceholder={
                                    catalog.has_description
                                        ? 'Buscar por nombre o descripción'
                                        : 'Buscar por nombre'
                                }
                                query={filters}
                                onQueryChange={changeQuery}
                                filters={
                                    catalog.has_active
                                        ? [
                                              {
                                                  id: 'status',
                                                  label: 'Filtrar por estado',
                                                  placeholder:
                                                      'Todos los estados',
                                                  options: [
                                                      {
                                                          label: 'Activos',
                                                          value: 'active',
                                                      },
                                                      {
                                                          label: 'Inactivos',
                                                          value: 'inactive',
                                                      },
                                                  ],
                                              },
                                          ]
                                        : []
                                }
                                pagination={{
                                    currentPage: records.current_page,
                                    from: records.from,
                                    lastPage: records.last_page,
                                    perPage: records.per_page,
                                    to: records.to,
                                    total: records.total,
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Nuevo registro</SheetTitle>
                        <SheetDescription>
                            Agrega un valor al catálogo {catalog.title}.
                        </SheetDescription>
                    </SheetHeader>
                    <CatalogRecordForm
                        catalog={catalog}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

function CatalogRecordRowActions({
    catalog,
    record,
}: {
    catalog: CatalogMeta;
    record: CatalogRecord;
}) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Editar ${record.name}`}
                onClick={() => setEditOpen(true)}
            >
                <Pencil />
            </Button>

            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Editar registro</SheetTitle>
                        <SheetDescription>
                            Actualiza {record.name} en el catálogo{' '}
                            {catalog.title}.
                        </SheetDescription>
                    </SheetHeader>
                    <CatalogRecordForm
                        catalog={catalog}
                        record={record}
                        onSuccess={() => setEditOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

function CatalogRecordForm({
    catalog,
    onSuccess,
    record,
}: {
    catalog: CatalogMeta;
    onSuccess: () => void;
    record?: CatalogRecord;
}) {
    const fieldId = record
        ? `${catalog.slug}-${record.id}`
        : `${catalog.slug}-new`;

    return (
        <Form
            {...(record
                ? CatalogController.update.form([catalog.slug, record.id])
                : CatalogController.store.form(catalog.slug))}
            onSuccess={onSuccess}
            options={{ preserveScroll: true }}
            className="flex flex-col gap-5 px-5 pb-5"
        >
            {({ errors, processing }) => (
                <>
                    <FieldGroup className="grid gap-4">
                        <Field data-invalid={Boolean(errors.name)}>
                            <FieldLabel htmlFor={`name-${fieldId}`}>
                                Nombre
                            </FieldLabel>
                            <Input
                                id={`name-${fieldId}`}
                                name="name"
                                defaultValue={record?.name ?? ''}
                                placeholder="Nombre del registro"
                                required
                                aria-invalid={Boolean(errors.name)}
                            />
                            <InputError message={errors.name} />
                        </Field>

                        {catalog.has_description && (
                            <Field data-invalid={Boolean(errors.description)}>
                                <FieldLabel htmlFor={`description-${fieldId}`}>
                                    Descripción
                                </FieldLabel>
                                <Textarea
                                    id={`description-${fieldId}`}
                                    name="description"
                                    defaultValue={record?.description ?? ''}
                                    placeholder="Descripción opcional"
                                    aria-invalid={Boolean(errors.description)}
                                />
                                <InputError message={errors.description} />
                            </Field>
                        )}

                        {catalog.has_active && (
                            <Field data-invalid={Boolean(errors.active)}>
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id={`active-${fieldId}`}
                                        name="active"
                                        value="1"
                                        defaultChecked={
                                            record ? record.active : true
                                        }
                                    />
                                    <FieldLabel htmlFor={`active-${fieldId}`}>
                                        Activo
                                    </FieldLabel>
                                </div>
                                <InputError message={errors.active} />
                            </Field>
                        )}
                    </FieldGroup>

                    <SheetFooter>
                        <Button type="submit" disabled={processing}>
                            {record ? 'Guardar cambios' : 'Crear registro'}
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}

AdminCatalogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Catálogos',
            href: '/admin/catalogs',
        },
    ],
};
