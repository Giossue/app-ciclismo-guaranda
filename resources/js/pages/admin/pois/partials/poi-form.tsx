import { Form, Link } from '@inertiajs/react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
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
    'min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

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

    return (
        <Form {...formAction} options={{ preserveScroll: true }}>
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
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={poi?.name ?? ''}
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
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2 md:col-span-3">
                                <Label>Rutas disponibles</Label>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    {routes.map((route) => (
                                        <span key={route.id}>
                                            {route.id}: {route.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <TextAreaField
                                id="route_links_text"
                                name="route_links_text"
                                label="Asociación POI-ruta"
                                defaultValue={poi?.route_links_text}
                                error={errors.route_links_text}
                                placeholder="1|1|4.5|Parada obligatoria"
                            />

                            <TextAreaField
                                id="hours_text"
                                name="hours_text"
                                label="Horarios"
                                defaultValue={poi?.hours_text}
                                error={errors.hours_text}
                                placeholder="1|08:00|18:00|Lunes"
                            />

                            <TextAreaField
                                id="images_text"
                                name="images_text"
                                label="Imágenes"
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
                                Completa solo los campos que correspondan a la
                                categoría seleccionada.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <section className="grid gap-4 md:grid-cols-2">
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

                            <section className="grid gap-4 md:grid-cols-2">
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

                            <section className="grid gap-4 md:grid-cols-2">
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

                            <section className="grid gap-4 md:grid-cols-2">
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

                            <section className="grid gap-4 md:grid-cols-2">
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
                            <Button disabled={processing}>
                                {isEdit ? 'Guardar cambios' : 'Crear POI'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Form>
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
}: {
    id: string;
    name: string;
    label: string;
    defaultChecked: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox
                id={id}
                name={name}
                value="1"
                defaultChecked={defaultChecked}
            />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}
