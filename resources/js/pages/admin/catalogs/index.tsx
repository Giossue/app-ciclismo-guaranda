import { Form, Head, router } from '@inertiajs/react';
import { EllipsisVertical, Pencil } from 'lucide-react';
import { useState } from 'react';
import CatalogController from '@/actions/App/Http/Controllers/Admin/CatalogController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { PrimaryActionButton } from '@/components/primary-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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

type CatalogSummary = {
    has_active: boolean;
    has_description: boolean;
    locked: boolean;
    slug: string;
    title: string;
};

/** Lo mínimo que el formulario necesita saber del catálogo destino. */
type CatalogFormTarget = {
    has_active: boolean;
    has_description: boolean;
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

export default function AdminCatalogsIndex({
    catalog,
    domain,
    domains,
    filters,
    records,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);

    const changeQuery = (query: DataTableQuery) => {
        const requestedDomain = String(query.domain ?? domain.slug);
        const domainChanged = requestedDomain !== domain.slug;
        const selectedDomain = domains.find(
            (option) => option.slug === requestedDomain,
        );
        const selectedCatalog = domainChanged
            ? selectedDomain?.catalogs[0]?.slug
            : String(query.catalog ?? catalog.slug);
        const contextChanged =
            domainChanged || selectedCatalog !== catalog.slug;
        const nextQuery = contextChanged
            ? {
                  domain: requestedDomain,
                  catalog: selectedCatalog ?? catalog.slug,
                  per_page: query.per_page ?? filters.per_page,
              }
            : {
                  ...query,
                  domain: requestedDomain,
                  catalog: selectedCatalog ?? catalog.slug,
              };

        router.get(CatalogController.index.url(), nextQuery, {
            only: ['catalog', 'domain', 'domains', 'records', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Catálogos"
                        description="Administra los valores operativos que usa cada módulo de Guaranda Go."
                    />
                    <PrimaryActionButton
                        label="Nuevo registro"
                        onClick={() => setCreateOpen(true)}
                    />
                </div>

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
                    filters={[
                        {
                            id: 'domain',
                            persistent: true,
                            label: 'Filtrar por sección',
                            placeholder: 'Todas las secciones',
                            options: domains.map((option) => ({
                                label: option.title,
                                value: option.slug,
                            })),
                        },
                        {
                            id: 'catalog',
                            persistent: true,
                            label: 'Filtrar por catálogo',
                            placeholder: 'Todos los catálogos',
                            options:
                                domains
                                    .find(
                                        (option) => option.slug === domain.slug,
                                    )
                                    ?.catalogs.map((option) => ({
                                        label: option.title,
                                        value: option.slug,
                                    })) ?? [],
                        },
                        ...(catalog.has_active
                            ? [
                                  {
                                      id: 'status',
                                      label: 'Filtrar por estado',
                                      placeholder: 'Todos los estados',
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
                            : []),
                    ]}
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

            <CreateRecordSheet
                catalog={catalog}
                domain={domain}
                domains={domains}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={(created) => {
                    if (created.slug !== catalog.slug) {
                        changeQuery({
                            domain: created.domain,
                            catalog: created.slug,
                            per_page: filters.per_page,
                        });
                    }
                }}
            />
        </>
    );
}

function CreateRecordSheet({
    catalog,
    domain,
    domains,
    onCreated,
    onOpenChange,
    open,
}: {
    catalog: CatalogMeta;
    domain: SelectedDomain;
    domains: CatalogDomain[];
    onCreated: (created: { domain: string; slug: string }) => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Nuevo registro</SheetTitle>
                    <SheetDescription>
                        Elige dónde crearlo; los campos se ajustan al catálogo.
                    </SheetDescription>
                </SheetHeader>

                {/*
                 * Radix desmonta el contenido al cerrar, así que este bloque se
                 * reinicia solo y siempre parte del contexto de la tabla.
                 */}
                <CreateRecordFields
                    catalog={catalog}
                    domain={domain}
                    domains={domains}
                    onCreated={onCreated}
                    onOpenChange={onOpenChange}
                />
            </SheetContent>
        </Sheet>
    );
}

function CreateRecordFields({
    catalog,
    domain,
    domains,
    onCreated,
    onOpenChange,
}: {
    catalog: CatalogMeta;
    domain: SelectedDomain;
    domains: CatalogDomain[];
    onCreated: (created: { domain: string; slug: string }) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const [domainSlug, setDomainSlug] = useState(domain.slug);
    const [catalogSlug, setCatalogSlug] = useState(catalog.slug);

    const catalogsOfDomain =
        domains.find((option) => option.slug === domainSlug)?.catalogs ?? [];
    const target =
        catalogsOfDomain.find((option) => option.slug === catalogSlug) ??
        catalogsOfDomain[0];

    const selectDomain = (value: string) => {
        setDomainSlug(value);
        setCatalogSlug(
            domains.find((option) => option.slug === value)?.catalogs[0]
                ?.slug ?? '',
        );
    };

    if (!target) {
        return null;
    }

    return (
        <CatalogRecordForm
            key={target.slug}
            catalog={target}
            onSuccess={() => {
                onOpenChange(false);
                onCreated({
                    domain: domainSlug,
                    slug: target.slug,
                });
            }}
            target={
                <>
                    <Field>
                        <FieldLabel htmlFor="create-domain">Sección</FieldLabel>
                        <Select value={domainSlug} onValueChange={selectDomain}>
                            <SelectTrigger id="create-domain">
                                <SelectValue placeholder="Selecciona una sección" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {domains.map((option) => (
                                        <SelectItem
                                            key={option.slug}
                                            value={option.slug}
                                        >
                                            {option.title}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="create-catalog">
                            Catálogo
                        </FieldLabel>
                        <Select
                            value={target.slug}
                            onValueChange={setCatalogSlug}
                        >
                            <SelectTrigger id="create-catalog">
                                <SelectValue placeholder="Selecciona un catálogo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {catalogsOfDomain.map((option) => (
                                        <SelectItem
                                            key={option.slug}
                                            value={option.slug}
                                        >
                                            {option.title}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </>
            }
            onCancel={() => onOpenChange(false)}
        />
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para ${record.name}`}
                    >
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                            <Pencil />
                            Editar registro
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

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
                        onCancel={() => setEditOpen(false)}
                        onSuccess={() => setEditOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

function CatalogRecordForm({
    catalog,
    onCancel,
    onSuccess,
    record,
    target,
}: {
    catalog: CatalogFormTarget;
    onCancel: () => void;
    onSuccess: () => void;
    record?: CatalogRecord;
    target?: React.ReactNode;
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
                        {target}

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
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
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
