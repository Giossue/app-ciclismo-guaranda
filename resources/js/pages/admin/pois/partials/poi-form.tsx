import { Form, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import ImageFileInput from '@/components/image-file-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { CatalogOption } from '@/types';

type PoiFormData = {
    id: number;
    poi_category_id: number;
    name: string;
    description: string | null;
    observations: string | null;
    latitude: string;
    longitude: string;
    address: string | null;
    phone: string | null;
    active: boolean;
    hours_text: string;
    images_text: string;
    route_links_text: string;
    cuisine_type_id: number | null;
    price_range_id: number | null;
    is_pet_friendly: boolean;
    has_wifi: boolean;
    accepted_payment_type: string | null;
    has_bike_parking: boolean;
    chef_recommendation: string | null;
    menu_url: string | null;
    lodging_type_id: number | null;
    allows_bikes_in_room: boolean;
    has_bike_wash_area: boolean;
    base_price: string | null;
    store_type_id: number | null;
    sells_hydration: boolean;
    sells_snacks: boolean;
    workshop_specialty_id: number | null;
    emergency_service: boolean;
    emergency_phone: string | null;
    workshop_service_ids_text: string;
    health_center_type_id: number | null;
    has_defibrillator: boolean;
    care_level: number | null;
};

type Props = {
    mode: 'create' | 'edit';
    poi?: PoiFormData;
    categories: CatalogOption[];
    routes: CatalogOption[];
    cuisineTypes: CatalogOption[];
    priceRanges: CatalogOption[];
    lodgingTypes: CatalogOption[];
    storeTypes: CatalogOption[];
    workshopSpecialties: CatalogOption[];
    workshopServices: CatalogOption[];
    healthCenterTypes: CatalogOption[];
};

const textareaClass =
    'min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export default function PoiForm({
    mode,
    poi,
    categories,
    routes,
    cuisineTypes,
    priceRanges,
    lodgingTypes,
    storeTypes,
    workshopSpecialties,
    workshopServices,
    healthCenterTypes,
}: Props) {
    const isEdit = mode === 'edit' && poi !== undefined;
    const formAction = isEdit
        ? PoiController.update.form(poi.id)
        : PoiController.store.form();
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        poi?.poi_category_id == null ? '' : String(poi.poi_category_id),
    );
    const [isCompressing, setIsCompressing] = useState(false);
    const [routeAssociations, setRouteAssociations] = useState<
        RouteAssociation[]
    >(() => parseRouteAssociations(poi?.route_links_text));
    const routeLinksText = useMemo(
        () => serializeRouteAssociations(routeAssociations),
        [routeAssociations],
    );
    const selectedCategoryName =
        categories
            .find((category) => String(category.id) === selectedCategoryId)
            ?.name.toLocaleLowerCase() ?? '';

    const toggleRouteAssociation = (routeId: number, checked: boolean) => {
        setRouteAssociations((current) => {
            if (!checked) {
                return current.filter((item) => item.routeId !== routeId);
            }

            if (current.some((item) => item.routeId === routeId)) {
                return current;
            }

            return [
                ...current,
                {
                    routeId,
                    required: false,
                    distance: '',
                    observation: '',
                },
            ];
        });
    };

    const updateRouteAssociation = (
        routeId: number,
        values: Partial<Omit<RouteAssociation, 'routeId'>>,
    ) => {
        setRouteAssociations((current) =>
            current.map((item) =>
                item.routeId === routeId ? { ...item, ...values } : item,
            ),
        );
    };

    return (
        <Form
            {...formAction}
            options={{ preserveScroll: true }}
            encType="multipart/form-data"
        >
            {({ processing, errors }) => (
                <div className="flex flex-col gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos base</CardTitle>
                            <CardDescription>
                                Crea un punto oficial visible en rutas y mapas
                                cuando esté activo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <CatalogSelect
                                id="poi_category_id"
                                name="poi_category_id"
                                label="Categoría"
                                placeholder="Selecciona categoría"
                                options={categories}
                                defaultValue={poi?.poi_category_id}
                                error={errors.poi_category_id}
                                onValueChange={setSelectedCategoryId}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={poi?.name ?? ''}
                                    placeholder="Ej. Mirador de la Cruz"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="description">Descripción</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={poi?.description ?? ''}
                                    className={textareaClass}
                                    placeholder="Qué encontrará el ciclista en este lugar"
                                    aria-invalid={Boolean(errors.description)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="observations">
                                    Observaciones
                                </Label>
                                <textarea
                                    id="observations"
                                    name="observations"
                                    defaultValue={poi?.observations ?? ''}
                                    className={textareaClass}
                                    placeholder="Referencia, acceso, seguridad, temporada"
                                    aria-invalid={Boolean(errors.observations)}
                                />
                                <InputError message={errors.observations} />
                            </div>

                            <NumberField
                                id="latitude"
                                name="latitude"
                                label="Latitud"
                                defaultValue={poi?.latitude}
                                error={errors.latitude}
                            />

                            <NumberField
                                id="longitude"
                                name="longitude"
                                label="Longitud"
                                defaultValue={poi?.longitude}
                                error={errors.longitude}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="address">
                                    Dirección/referencia
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={poi?.address ?? ''}
                                    placeholder="Ej. A 200 m del parque central"
                                    aria-invalid={Boolean(errors.address)}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={poi?.phone ?? ''}
                                    placeholder="Ej. 0999999999"
                                    aria-invalid={Boolean(errors.phone)}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <CheckboxField
                                id="active"
                                name="active"
                                label="POI activo"
                                defaultChecked={poi?.active ?? true}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rutas, horarios e imágenes</CardTitle>
                            <CardDescription>
                                Usa una línea por registro. Rutas:{' '}
                                <code>route_id|obligatorio|km|observación</code>
                                . Horarios: <code>día|abre|cierra|nota</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <RouteAssociationsField
                                routes={routes}
                                associations={routeAssociations}
                                routeLinksText={routeLinksText}
                                error={errors.route_links_text}
                                onToggle={toggleRouteAssociation}
                                onUpdate={updateRouteAssociation}
                            />

                            <TextAreaField
                                id="hours_text"
                                name="hours_text"
                                label="Horarios"
                                defaultValue={poi?.hours_text}
                                error={errors.hours_text}
                                placeholder="1|08:00|18:00|Lunes"
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="images">Imágenes del POI</Label>
                                <ImageFileInput
                                    id="images"
                                    name="images[]"
                                    multiple
                                    maxFiles={8}
                                    invalid={Boolean(errors.images)}
                                    onProcessingChange={setIsCompressing}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Puedes seleccionar varias fotos del POI
                                    (hasta 8). Cada una se optimiza a 5 MB o
                                    menos automáticamente.
                                </p>
                                <InputError message={errors.images} />
                                <InputError message={errors['images.0']} />
                            </div>

                            <TextAreaField
                                id="images_text"
                                name="images_text"
                                label="Imágenes ya existentes o rutas internas"
                                defaultValue={poi?.images_text}
                                error={errors.images_text}
                                placeholder="pois/mirador.jpg|Vista principal"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles por categoría</CardTitle>
                            <CardDescription>
                                Selecciona una categoría para ver solo los
                                detalles que corresponden a ese tipo de punto de
                                interés.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <section
                                className={
                                    selectedCategoryName === 'comida'
                                        ? 'grid gap-4 md:grid-cols-2'
                                        : 'hidden'
                                }
                            >
                                <h2 className="font-medium md:col-span-2">
                                    Comida
                                </h2>
                                <CatalogSelect
                                    id="cuisine_type_id"
                                    name="cuisine_type_id"
                                    label="Tipo de cocina"
                                    placeholder="Selecciona tipo"
                                    options={cuisineTypes}
                                    defaultValue={poi?.cuisine_type_id}
                                    error={errors.cuisine_type_id}
                                    required={false}
                                />
                                <CatalogSelect
                                    id="price_range_id"
                                    name="price_range_id"
                                    label="Rango de precio"
                                    placeholder="Selecciona rango"
                                    options={priceRanges}
                                    defaultValue={poi?.price_range_id}
                                    error={errors.price_range_id}
                                    required={false}
                                />
                                <CheckboxField
                                    id="is_pet_friendly"
                                    name="is_pet_friendly"
                                    label="Pet friendly"
                                    defaultChecked={
                                        poi?.is_pet_friendly ?? false
                                    }
                                />
                                <CheckboxField
                                    id="has_wifi"
                                    name="has_wifi"
                                    label="Tiene WiFi"
                                    defaultChecked={poi?.has_wifi ?? false}
                                />
                                <CheckboxField
                                    id="has_bike_parking"
                                    name="has_bike_parking"
                                    label="Parqueadero de bicicletas"
                                    defaultChecked={
                                        poi?.has_bike_parking ?? false
                                    }
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="menu_url">
                                        URL de menú
                                    </Label>
                                    <Input
                                        id="menu_url"
                                        name="menu_url"
                                        defaultValue={poi?.menu_url ?? ''}
                                    />
                                    <InputError message={errors.menu_url} />
                                </div>
                                <TextAreaField
                                    id="chef_recommendation"
                                    name="chef_recommendation"
                                    label="Recomendación"
                                    defaultValue={poi?.chef_recommendation}
                                    error={errors.chef_recommendation}
                                />
                            </section>

                            <Separator />

                            <section
                                className={
                                    selectedCategoryName === 'tienda'
                                        ? 'grid gap-4 md:grid-cols-2'
                                        : 'hidden'
                                }
                            >
                                <h2 className="font-medium md:col-span-2">
                                    Tienda y pagos
                                </h2>
                                <CatalogSelect
                                    id="store_type_id"
                                    name="store_type_id"
                                    label="Tipo de tienda"
                                    placeholder="Selecciona tipo"
                                    options={storeTypes}
                                    defaultValue={poi?.store_type_id}
                                    error={errors.store_type_id}
                                    required={false}
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="accepted_payment_type">
                                        Tipo de pago aceptado
                                    </Label>
                                    <Input
                                        id="accepted_payment_type"
                                        name="accepted_payment_type"
                                        defaultValue={
                                            poi?.accepted_payment_type ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.accepted_payment_type}
                                    />
                                </div>
                                <CheckboxField
                                    id="sells_hydration"
                                    name="sells_hydration"
                                    label="Vende hidratación"
                                    defaultChecked={
                                        poi?.sells_hydration ?? false
                                    }
                                />
                                <CheckboxField
                                    id="sells_snacks"
                                    name="sells_snacks"
                                    label="Vende snacks"
                                    defaultChecked={poi?.sells_snacks ?? false}
                                />
                            </section>

                            <Separator />

                            <section
                                className={
                                    selectedCategoryName === 'hospedaje'
                                        ? 'grid gap-4 md:grid-cols-2'
                                        : 'hidden'
                                }
                            >
                                <h2 className="font-medium md:col-span-2">
                                    Hospedaje
                                </h2>
                                <CatalogSelect
                                    id="lodging_type_id"
                                    name="lodging_type_id"
                                    label="Tipo de hospedaje"
                                    placeholder="Selecciona tipo"
                                    options={lodgingTypes}
                                    defaultValue={poi?.lodging_type_id}
                                    error={errors.lodging_type_id}
                                    required={false}
                                />
                                <NumberField
                                    id="base_price"
                                    name="base_price"
                                    label="Precio base"
                                    defaultValue={poi?.base_price}
                                    error={errors.base_price}
                                    min="0"
                                />
                                <CheckboxField
                                    id="allows_bikes_in_room"
                                    name="allows_bikes_in_room"
                                    label="Permite bicicletas en habitación"
                                    defaultChecked={
                                        poi?.allows_bikes_in_room ?? false
                                    }
                                />
                                <CheckboxField
                                    id="has_bike_wash_area"
                                    name="has_bike_wash_area"
                                    label="Área de lavado de bicicletas"
                                    defaultChecked={
                                        poi?.has_bike_wash_area ?? false
                                    }
                                />
                            </section>

                            <Separator />

                            <section
                                className={
                                    selectedCategoryName === 'taller'
                                        ? 'grid gap-4 md:grid-cols-2'
                                        : 'hidden'
                                }
                            >
                                <h2 className="font-medium md:col-span-2">
                                    Taller
                                </h2>
                                <CatalogSelect
                                    id="workshop_specialty_id"
                                    name="workshop_specialty_id"
                                    label="Especialidad"
                                    placeholder="Selecciona especialidad"
                                    options={workshopSpecialties}
                                    defaultValue={poi?.workshop_specialty_id}
                                    error={errors.workshop_specialty_id}
                                    required={false}
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency_phone">
                                        Teléfono de emergencia
                                    </Label>
                                    <Input
                                        id="emergency_phone"
                                        name="emergency_phone"
                                        defaultValue={
                                            poi?.emergency_phone ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.emergency_phone}
                                    />
                                </div>
                                <CheckboxField
                                    id="emergency_service"
                                    name="emergency_service"
                                    label="Servicio de emergencia"
                                    defaultChecked={
                                        poi?.emergency_service ?? false
                                    }
                                />
                                <div className="grid gap-2 md:col-span-2">
                                    <Label>Servicios disponibles</Label>
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        {workshopServices.map((service) => (
                                            <span key={service.id}>
                                                {service.id}: {service.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <TextAreaField
                                    id="workshop_service_ids_text"
                                    name="workshop_service_ids_text"
                                    label="IDs de servicios de taller"
                                    defaultValue={
                                        poi?.workshop_service_ids_text
                                    }
                                    error={errors.workshop_service_ids_text}
                                    placeholder="1\n2\n3"
                                />
                            </section>

                            <Separator />

                            <section
                                className={
                                    selectedCategoryName === 'salud'
                                        ? 'grid gap-4 md:grid-cols-2'
                                        : 'hidden'
                                }
                            >
                                <h2 className="font-medium md:col-span-2">
                                    Salud
                                </h2>
                                <CatalogSelect
                                    id="health_center_type_id"
                                    name="health_center_type_id"
                                    label="Tipo de centro"
                                    placeholder="Selecciona tipo"
                                    options={healthCenterTypes}
                                    defaultValue={poi?.health_center_type_id}
                                    error={errors.health_center_type_id}
                                    required={false}
                                />
                                <NumberField
                                    id="care_level"
                                    name="care_level"
                                    label="Nivel de atención (1-4)"
                                    defaultValue={poi?.care_level}
                                    error={errors.care_level}
                                    min="1"
                                    step="1"
                                />
                                <CheckboxField
                                    id="has_defibrillator"
                                    name="has_defibrillator"
                                    label="Tiene desfibrilador"
                                    defaultChecked={
                                        poi?.has_defibrillator ?? false
                                    }
                                />
                            </section>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/admin/pois" prefetch>
                                    Cancelar
                                </Link>
                            </Button>
                            <Button disabled={processing || isCompressing}>
                                {isEdit ? 'Guardar cambios' : 'Crear POI'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Form>
    );
}

type RouteAssociation = {
    routeId: number;
    required: boolean;
    distance: string;
    observation: string;
};

function parseRouteAssociations(value?: string | null): RouteAssociation[] {
    if (!value) {
        return [];
    }

    return value
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [routeId, required, distance, observation] = line.split('|');

            return {
                routeId: Number(routeId),
                required: ['1', 'si', 'sí'].includes(required ?? ''),
                distance: distance ?? '',
                observation: observation ?? '',
            };
        })
        .filter((item) => Number.isFinite(item.routeId));
}

function serializeRouteAssociations(associations: RouteAssociation[]): string {
    return associations
        .map((item) =>
            [
                item.routeId,
                item.required ? '1' : '0',
                item.distance,
                item.observation,
            ].join('|'),
        )
        .join('\n');
}

function RouteAssociationsField({
    routes,
    associations,
    routeLinksText,
    error,
    onToggle,
    onUpdate,
}: {
    routes: CatalogOption[];
    associations: RouteAssociation[];
    routeLinksText: string;
    error?: string;
    onToggle: (routeId: number, checked: boolean) => void;
    onUpdate: (
        routeId: number,
        values: Partial<Omit<RouteAssociation, 'routeId'>>,
    ) => void;
}) {
    return (
        <div className="grid gap-3 md:col-span-3">
            <input
                type="hidden"
                name="route_links_text"
                value={routeLinksText}
            />
            <div className="grid gap-1">
                <Label>Rutas asociadas</Label>
                <p className="text-sm text-muted-foreground">
                    Selecciona rutas y completa km/observación sin escribir IDs.
                </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                {routes.map((route) => {
                    const association = associations.find(
                        (item) => item.routeId === route.id,
                    );
                    const checked = association !== undefined;

                    return (
                        <div
                            key={route.id}
                            className={cn(
                                'grid gap-3 rounded-2xl border p-3 transition-colors',
                                checked
                                    ? 'border-primary bg-primary/5'
                                    : 'bg-card',
                            )}
                        >
                            <label className="flex items-start gap-3">
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) =>
                                        onToggle(route.id, value === true)
                                    }
                                />
                                <span className="grid gap-1">
                                    <span className="text-sm font-semibold">
                                        {route.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Ruta #{route.id}
                                    </span>
                                </span>
                            </label>

                            {association && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <CheckboxField
                                        id={`route_required_${route.id}`}
                                        name={`route_required_${route.id}`}
                                        label="Obligatorio"
                                        defaultChecked={association.required}
                                        onCheckedChange={(checked) =>
                                            onUpdate(route.id, {
                                                required: checked,
                                            })
                                        }
                                    />
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`route_distance_${route.id}`}
                                        >
                                            Km desde inicio
                                        </Label>
                                        <Input
                                            id={`route_distance_${route.id}`}
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            value={association.distance}
                                            onChange={(event) =>
                                                onUpdate(route.id, {
                                                    distance:
                                                        event.currentTarget
                                                            .value,
                                                })
                                            }
                                            placeholder="Ej. 4.5"
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label
                                            htmlFor={`route_observation_${route.id}`}
                                        >
                                            Observación en ruta
                                        </Label>
                                        <Input
                                            id={`route_observation_${route.id}`}
                                            value={association.observation}
                                            onChange={(event) =>
                                                onUpdate(route.id, {
                                                    observation:
                                                        event.currentTarget
                                                            .value,
                                                })
                                            }
                                            placeholder="Ej. Parada obligatoria"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <InputError message={error} />
        </div>
    );
}

type CatalogSelectProps = {
    id: string;
    name: string;
    label: string;
    placeholder: string;
    options: CatalogOption[];
    defaultValue?: number | null;
    error?: string;
    required?: boolean;
    onValueChange?: (value: string) => void;
};

function CatalogSelect({
    id,
    name,
    label,
    placeholder,
    options,
    defaultValue,
    error,
    required = true,
    onValueChange,
}: CatalogSelectProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
                name={name}
                defaultValue={
                    defaultValue == null ? undefined : String(defaultValue)
                }
                required={required}
                onValueChange={onValueChange}
            >
                <SelectTrigger
                    id={id}
                    className="w-full"
                    aria-invalid={Boolean(error)}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem
                                key={option.id}
                                value={String(option.id)}
                            >
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

type NumberFieldProps = {
    id: string;
    name: string;
    label: string;
    defaultValue?: string | number | null;
    error?: string;
    min?: string;
    step?: string;
};

function NumberField({
    id,
    name,
    label,
    defaultValue,
    error,
    min,
    step = 'any',
}: NumberFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type="number"
                min={min}
                step={step}
                defaultValue={defaultValue ?? ''}
                required={id === 'latitude' || id === 'longitude'}
                aria-invalid={Boolean(error)}
            />
            <InputError message={error} />
        </div>
    );
}

type TextAreaFieldProps = {
    id: string;
    name: string;
    label: string;
    defaultValue?: string | null;
    error?: string;
    placeholder?: string;
};

function TextAreaField({
    id,
    name,
    label,
    defaultValue,
    error,
    placeholder,
}: TextAreaFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <textarea
                id={id}
                name={name}
                defaultValue={defaultValue ?? ''}
                className={textareaClass}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
            />
            <InputError message={error} />
        </div>
    );
}

function CheckboxField({
    id,
    name,
    label,
    defaultChecked,
    onCheckedChange,
}: {
    id: string;
    name: string;
    label: string;
    defaultChecked: boolean;
    onCheckedChange?: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                name={name}
                value="1"
                defaultChecked={defaultChecked}
                onCheckedChange={(value) => onCheckedChange?.(value === true)}
            />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
