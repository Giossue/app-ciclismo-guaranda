import { Form, Link } from '@inertiajs/react';
import RouteController from '@/actions/App/Http/Controllers/Admin/RouteController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { Separator } from '@/components/ui/separator';
import type { CatalogOption } from '@/types';

type RouteFormData = {
    id: number;
    route_status_id: number;
    route_category_id: number;
    route_difficulty_id: number;
    name: string;
    description: string;
    start_name: string;
    start_latitude: string;
    start_longitude: string;
    end_name: string;
    end_latitude: string;
    end_longitude: string;
    road_type: string | null;
    required_experience: string | null;
    main_image_path: string | null;
    route_version: number;
    geojson: string;
    transport_mode_id: number | null;
    routing_engine_id: number | null;
    distance_km: string | null;
    estimated_time_minutes: number | null;
    positive_elevation_m: string | null;
    negative_elevation_m: string | null;
    recommendations_text: string;
    observations_text: string;
    additional_images_text: string;
};

type Props = {
    mode: 'create' | 'edit';
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    defaultGeojson?: string;
    route?: RouteFormData;
};

const textareaClass =
    'min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export default function RouteForm({
    mode,
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    defaultGeojson,
    route,
}: Props) {
    const isEdit = mode === 'edit' && route !== undefined;
    const formAction = isEdit
        ? RouteController.update.form(route.id)
        : RouteController.store.form();

    return (
        <Form {...formAction} options={{ preserveScroll: true }}>
            {({ processing, errors }) => (
                <div className="flex flex-col gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos principales</CardTitle>
                            <CardDescription>
                                Define nombre, publicación, dificultad y
                                contexto operativo de la ruta oficial.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={route?.name ?? ''}
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
                                    defaultValue={route?.description ?? ''}
                                    required
                                    className={textareaClass}
                                    aria-invalid={Boolean(errors.description)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <CatalogSelect
                                id="route_status_id"
                                name="route_status_id"
                                label="Estado"
                                placeholder="Selecciona estado"
                                options={statuses}
                                defaultValue={route?.route_status_id}
                                error={errors.route_status_id}
                            />

                            <CatalogSelect
                                id="route_category_id"
                                name="route_category_id"
                                label="Categoría"
                                placeholder="Selecciona categoría"
                                options={categories}
                                defaultValue={route?.route_category_id}
                                error={errors.route_category_id}
                            />

                            <CatalogSelect
                                id="route_difficulty_id"
                                name="route_difficulty_id"
                                label="Dificultad"
                                placeholder="Selecciona dificultad"
                                options={difficulties}
                                defaultValue={route?.route_difficulty_id}
                                error={errors.route_difficulty_id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="road_type">Tipo de vía</Label>
                                <Input
                                    id="road_type"
                                    name="road_type"
                                    defaultValue={route?.road_type ?? ''}
                                    placeholder="Asfalto, lastre, sendero..."
                                    required
                                    aria-invalid={Boolean(errors.road_type)}
                                />
                                <InputError message={errors.road_type} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="required_experience">
                                    Experiencia requerida
                                </Label>
                                <textarea
                                    id="required_experience"
                                    name="required_experience"
                                    defaultValue={
                                        route?.required_experience ?? ''
                                    }
                                    required
                                    className={textareaClass}
                                    aria-invalid={Boolean(
                                        errors.required_experience,
                                    )}
                                />
                                <InputError
                                    message={errors.required_experience}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inicio, final y geometría</CardTitle>
                            <CardDescription>
                                La geometría se guarda como GeoJSON LineString.
                                El dibujo en mapa queda para la siguiente fase.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="start_name">
                                    Nombre del inicio
                                </Label>
                                <Input
                                    id="start_name"
                                    name="start_name"
                                    defaultValue={route?.start_name ?? ''}
                                    required
                                    aria-invalid={Boolean(errors.start_name)}
                                />
                                <InputError message={errors.start_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end_name">
                                    Nombre del final
                                </Label>
                                <Input
                                    id="end_name"
                                    name="end_name"
                                    defaultValue={route?.end_name ?? ''}
                                    required
                                    aria-invalid={Boolean(errors.end_name)}
                                />
                                <InputError message={errors.end_name} />
                            </div>

                            <NumberField
                                id="start_latitude"
                                name="start_latitude"
                                label="Latitud inicial"
                                defaultValue={route?.start_latitude}
                                error={errors.start_latitude}
                            />

                            <NumberField
                                id="start_longitude"
                                name="start_longitude"
                                label="Longitud inicial"
                                defaultValue={route?.start_longitude}
                                error={errors.start_longitude}
                            />

                            <NumberField
                                id="end_latitude"
                                name="end_latitude"
                                label="Latitud final"
                                defaultValue={route?.end_latitude}
                                error={errors.end_latitude}
                            />

                            <NumberField
                                id="end_longitude"
                                name="end_longitude"
                                label="Longitud final"
                                defaultValue={route?.end_longitude}
                                error={errors.end_longitude}
                            />

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="geojson">
                                    GeoJSON LineString
                                </Label>
                                <textarea
                                    id="geojson"
                                    name="geojson"
                                    defaultValue={
                                        route?.geojson ?? defaultGeojson ?? ''
                                    }
                                    required
                                    className={`${textareaClass} font-mono`}
                                    aria-invalid={Boolean(errors.geojson)}
                                />
                                <InputError message={errors.geojson} />
                                <InputError message={errors['geojson.type']} />
                                <InputError
                                    message={errors['geojson.coordinates']}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Métricas e imágenes</CardTitle>
                            <CardDescription>
                                Registra valores base para consumo móvil y
                                preparación de rutas offline.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <CatalogSelect
                                id="transport_mode_id"
                                name="transport_mode_id"
                                label="Medio de transporte"
                                placeholder="Selecciona medio"
                                options={transportModes}
                                defaultValue={route?.transport_mode_id}
                                error={errors.transport_mode_id}
                            />

                            <CatalogSelect
                                id="routing_engine_id"
                                name="routing_engine_id"
                                label="Motor de enrutamiento"
                                placeholder="Selecciona motor"
                                options={routingEngines}
                                defaultValue={route?.routing_engine_id}
                                error={errors.routing_engine_id}
                            />

                            <NumberField
                                id="distance_km"
                                name="distance_km"
                                label="Distancia (km)"
                                defaultValue={route?.distance_km}
                                error={errors.distance_km}
                                step="0.001"
                                min="0.001"
                            />

                            <NumberField
                                id="estimated_time_minutes"
                                name="estimated_time_minutes"
                                label="Tiempo estimado (min)"
                                defaultValue={route?.estimated_time_minutes}
                                error={errors.estimated_time_minutes}
                                step="1"
                                min="1"
                            />

                            <NumberField
                                id="positive_elevation_m"
                                name="positive_elevation_m"
                                label="Desnivel positivo (m)"
                                defaultValue={route?.positive_elevation_m}
                                error={errors.positive_elevation_m}
                                step="0.01"
                                min="0"
                            />

                            <NumberField
                                id="negative_elevation_m"
                                name="negative_elevation_m"
                                label="Desnivel negativo (m)"
                                defaultValue={route?.negative_elevation_m}
                                error={errors.negative_elevation_m}
                                step="0.01"
                                min="0"
                            />

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="main_image_path">
                                    Imagen principal
                                </Label>
                                <Input
                                    id="main_image_path"
                                    name="main_image_path"
                                    defaultValue={route?.main_image_path ?? ''}
                                    placeholder="routes/salinas-principal.jpg"
                                    required
                                    aria-invalid={Boolean(
                                        errors.main_image_path,
                                    )}
                                />
                                <InputError message={errors.main_image_path} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="additional_images_text">
                                    Imágenes adicionales
                                </Label>
                                <textarea
                                    id="additional_images_text"
                                    name="additional_images_text"
                                    defaultValue={
                                        route?.additional_images_text ?? ''
                                    }
                                    className={textareaClass}
                                    placeholder={
                                        'routes/mirador.jpg|Mirador principal\nroutes/descanso.jpg|Punto de descanso'
                                    }
                                    aria-invalid={Boolean(
                                        errors.additional_images_text,
                                    )}
                                />
                                <InputError
                                    message={errors.additional_images_text}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Recomendaciones y observaciones
                            </CardTitle>
                            <CardDescription>
                                Escribe un ítem por línea para mostrarlos como
                                listas en la app móvil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="recommendations_text">
                                    Recomendaciones
                                </Label>
                                <textarea
                                    id="recommendations_text"
                                    name="recommendations_text"
                                    defaultValue={
                                        route?.recommendations_text ?? ''
                                    }
                                    required
                                    className={textareaClass}
                                    aria-invalid={Boolean(
                                        errors.recommendations_text,
                                    )}
                                />
                                <InputError
                                    message={errors.recommendations_text}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="observations_text">
                                    Observaciones
                                </Label>
                                <textarea
                                    id="observations_text"
                                    name="observations_text"
                                    defaultValue={
                                        route?.observations_text ?? ''
                                    }
                                    required
                                    className={textareaClass}
                                    aria-invalid={Boolean(
                                        errors.observations_text,
                                    )}
                                />
                                <InputError
                                    message={errors.observations_text}
                                />
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                            {isEdit ? (
                                <Alert className="sm:max-w-md">
                                    <AlertTitle>
                                        Versión actual {route.route_version}
                                    </AlertTitle>
                                    <AlertDescription>
                                        Si cambias datos relevantes, la ruta
                                        incrementará su versión automáticamente.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    La ruta iniciará en versión 1.
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/routes" prefetch>
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button disabled={processing}>
                                    {isEdit ? 'Guardar cambios' : 'Crear ruta'}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Form>
    );
}

type SelectProps = {
    id: string;
    name: string;
    label: string;
    placeholder: string;
    options: CatalogOption[];
    defaultValue?: number | null;
    error?: string;
};

function CatalogSelect({
    id,
    name,
    label,
    placeholder,
    options,
    defaultValue,
    error,
}: SelectProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
                name={name}
                defaultValue={
                    defaultValue == null ? undefined : String(defaultValue)
                }
                required
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
                required
                aria-invalid={Boolean(error)}
            />
            <InputError message={error} />
        </div>
    );
}
