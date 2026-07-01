import { Form, Head } from '@inertiajs/react';
import { Database, Plus, Save } from 'lucide-react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const textareaClass =
    'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

type CatalogRecord = {
    id: number;
    name: string;
    description?: string | null;
    active?: boolean | number | null;
};

type Catalog = {
    slug: string;
    title: string;
    table: string;
    locked: boolean;
    has_description: boolean;
    has_active: boolean;
    records: CatalogRecord[];
};

type Props = {
    catalogs: Catalog[];
};

export default function AdminCatalogsIndex({ catalogs }: Props) {
    const totalRecords = catalogs.reduce(
        (total, catalog) => total + catalog.records.length,
        0,
    );
    const [selectedCatalogSlug, setSelectedCatalogSlug] = useState(
        catalogs[0]?.slug ?? '',
    );
    const visibleCatalogs = catalogs.filter(
        (catalog) => catalog.slug === selectedCatalogSlug,
    );

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
                            {catalogs.length} catálogos
                        </Badge>
                        <Badge variant="outline">
                            {totalRecords} registros
                        </Badge>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Seleccionar catálogo</CardTitle>
                        <CardDescription>
                            Elige una sección para evitar recorrer todos los
                            catálogos en una sola pantalla.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={selectedCatalogSlug}
                            onValueChange={setSelectedCatalogSlug}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un catálogo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {catalogs.map((catalog) => (
                                        <SelectItem
                                            key={catalog.slug}
                                            value={catalog.slug}
                                        >
                                            {catalog.title}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <section className="grid gap-4">
                    {visibleCatalogs.map((catalog) => (
                        <Card key={catalog.slug}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="grid gap-1">
                                        <CardTitle>{catalog.title}</CardTitle>
                                        <CardDescription>
                                            Tabla: <code>{catalog.table}</code>
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {catalog.locked && (
                                            <Badge variant="outline">
                                                Base del sistema
                                            </Badge>
                                        )}
                                        {catalog.has_active && (
                                            <Badge variant="secondary">
                                                Activable
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <Form
                                    action={`/admin/catalogs/${catalog.slug}`}
                                    method="post"
                                    options={{ preserveScroll: true }}
                                    className="grid gap-3 rounded-2xl border bg-muted/20 p-3 md:grid-cols-[1fr_1.5fr_auto] md:items-start"
                                >
                                    {({ errors, processing, reset }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`${catalog.slug}_name_new`}
                                                >
                                                    Nuevo valor
                                                </Label>
                                                <Input
                                                    id={`${catalog.slug}_name_new`}
                                                    name="name"
                                                    placeholder="Nombre"
                                                    aria-invalid={Boolean(
                                                        errors.name,
                                                    )}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            {catalog.has_description && (
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor={`${catalog.slug}_description_new`}
                                                    >
                                                        Descripción
                                                    </Label>
                                                    <textarea
                                                        id={`${catalog.slug}_description_new`}
                                                        name="description"
                                                        className={
                                                            textareaClass
                                                        }
                                                        placeholder="Descripción opcional"
                                                        aria-invalid={Boolean(
                                                            errors.description,
                                                        )}
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.description
                                                        }
                                                    />
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-3">
                                                {catalog.has_active && (
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            name="active"
                                                            value="1"
                                                            defaultChecked
                                                            className="size-4 accent-primary"
                                                        />
                                                        Activo
                                                    </label>
                                                )}
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    onClick={() => {
                                                        if (!processing) {
                                                            window.setTimeout(
                                                                () => reset(),
                                                                50,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Plus data-icon="inline-start" />
                                                    Crear
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>

                                <div className="grid gap-3">
                                    {catalog.records.map((record) => (
                                        <Form
                                            key={record.id}
                                            action={`/admin/catalogs/${catalog.slug}/${record.id}`}
                                            method="patch"
                                            options={{ preserveScroll: true }}
                                            className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_1.5fr_auto] md:items-start"
                                        >
                                            {({ errors, processing }) => (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor={`${catalog.slug}_${record.id}_name`}
                                                        >
                                                            Nombre
                                                        </Label>
                                                        <Input
                                                            id={`${catalog.slug}_${record.id}_name`}
                                                            name="name"
                                                            defaultValue={
                                                                record.name
                                                            }
                                                            aria-invalid={Boolean(
                                                                errors.name,
                                                            )}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.name
                                                            }
                                                        />
                                                    </div>

                                                    {catalog.has_description && (
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`${catalog.slug}_${record.id}_description`}
                                                            >
                                                                Descripción
                                                            </Label>
                                                            <textarea
                                                                id={`${catalog.slug}_${record.id}_description`}
                                                                name="description"
                                                                defaultValue={
                                                                    record.description ??
                                                                    ''
                                                                }
                                                                className={
                                                                    textareaClass
                                                                }
                                                                aria-invalid={Boolean(
                                                                    errors.description,
                                                                )}
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.description
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-3">
                                                        {catalog.has_active && (
                                                            <label className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    name="active"
                                                                    value="1"
                                                                    defaultChecked={Boolean(
                                                                        record.active,
                                                                    )}
                                                                    className="size-4 accent-primary"
                                                                />
                                                                Activo
                                                            </label>
                                                        )}
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Save data-icon="inline-start" />
                                                            Guardar
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </>
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
