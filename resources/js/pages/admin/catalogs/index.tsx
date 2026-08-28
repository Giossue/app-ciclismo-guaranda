import { Form, Head, router } from '@inertiajs/react';
import { Database, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import CatalogController from '@/actions/App/Http/Controllers/Admin/CatalogController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    records_count: number;
    slug: string;
    title: string;
};

type CatalogMeta = {
    has_active: boolean;
    has_description: boolean;
    locked: boolean;
    slug: string;
    table: string;
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
    per_page: number;
    search: string;
    status: string;
};

type Props = {
    catalog: CatalogMeta;
    catalogs: CatalogSummary[];
    filters: CatalogFilters;
    records: PaginatedRecords;
    totals: {
        catalogs: number;
        records: number;
    };
};

export default function AdminCatalogsIndex({
    catalog,
    catalogs,
    filters,
    records,
    totals,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);

    const changeQuery = (query: DataTableQuery) => {
        router.get(
            CatalogController.index.url(),
            { ...query, catalog: query.catalog ?? catalog.slug },
            {
                only: ['catalog', 'records', 'filters'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const selectCatalog = (slug: string) => {
        changeQuery({ catalog: slug, per_page: filters.per_page });
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
                              variant={record.active ? 'secondary' : 'outline'}
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
                        title="Catálogos del sistema"
                        description="Administra roles, estados, categorías y tipos base usados por rutas, POIs, incidencias, recorridos y reportes."
                    />
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            <Database data-icon="inline-start" />
                            {totals.catalogs} catálogos
                        </Badge>
                        <Badge variant="outline">
                            {totals.records} registros
                        </Badge>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Seleccionar catálogo</CardTitle>
                        <CardDescription>
                            Elige una sección para administrar sus registros sin
                            recorrer todos los catálogos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <Select
                            value={catalog.slug}
                            onValueChange={selectCatalog}
                        >
                            <SelectTrigger
                                aria-label="Catálogo"
                                className="w-full lg:max-w-sm"
                            >
                                <SelectValue placeholder="Selecciona un catálogo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {catalogs.map((option) => (
                                        <SelectItem
                                            key={option.slug}
                                            value={option.slug}
                                        >
                                            {option.title} (
                                            {option.records_count})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <div className="flex flex-wrap items-center gap-2">
                            {catalog.locked && (
                                <Badge variant="outline">
                                    Base del sistema
                                </Badge>
                            )}
                            {catalog.has_active && (
                                <Badge variant="secondary">Activable</Badge>
                            )}
                        </div>

                        <Button
                            type="button"
                            className="lg:ml-auto"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus data-icon="inline-start" />
                            Nuevo registro
                        </Button>
                    </CardContent>
                </Card>

                <DataTable
                    title={catalog.title}
                    description={`Tabla: ${catalog.table}`}
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
