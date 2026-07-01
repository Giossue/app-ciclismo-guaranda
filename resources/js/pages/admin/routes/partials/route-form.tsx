import { Form, Link } from '@inertiajs/react';
import { ImageIcon, MapPin, Mountain, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import RouteController from '@/actions/App/Http/Controllers/Admin/RouteController';
import RouteGeometryEditor from '@/components/admin/routes/route-geometry-editor';
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
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
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
    poi_ids: number[];
};

type RoutePoiOption = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    category: CatalogOption | null;
};

type NewRoutePoi = {
    key: string;
    name: string;
    poi_category_id: string;
    description: string;
    latitude: string;
    longitude: string;
};

type Props = {
    mode: 'create' | 'edit';
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    poiCategories: CatalogOption[];
    pois: RoutePoiOption[];
    defaultGeojson?: string | null;
    route?: RouteFormData;
};

const textareaClass =
    'min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

const experienceOptions = [
    {
        value: 'Apta para principiantes con acompañamiento.',
        label: 'Principiante acompañado',
        description: 'Ritmo suave, ideal para primeras salidas guiadas.',
        keywords: ['principiante', 'básica', 'basica', 'suave'],
    },
    {
        value: 'Recomendada para familias o salidas recreativas.',
        label: 'Familiar / recreativa',
        description: 'Enfocada en turismo, pausas y menor exigencia técnica.',
        keywords: ['familia', 'familiar', 'recreativa'],
    },
    {
        value: 'Requiere experiencia media y bicicleta en buen estado.',
        label: 'Experiencia media',
        description: 'Subidas moderadas, tramos mixtos y control básico.',
        keywords: ['media', 'moderada', 'intermedia'],
    },
    {
        value: 'Requiere experiencia avanzada, buena condición física y control técnico.',
        label: 'Avanzada / técnica',
        description: 'Desnivel, senderos o tramos exigentes.',
        keywords: ['avanzada', 'técnica', 'tecnica', 'exigente'],
    },
    {
        value: 'Casco, luces, hidratación y kit básico son obligatorios.',
        label: 'Equipo obligatorio',
        description: 'Refuerza requisitos mínimos de seguridad.',
        keywords: ['casco', 'luces', 'hidratación', 'hidratacion', 'kit'],
    },
];

export default function RouteForm({
    mode,
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    poiCategories,
    pois,
    defaultGeojson,
    route,
}: Props) {
    const isEdit = mode === 'edit' && route !== undefined;
    const formAction = isEdit
        ? RouteController.update.form(route.id)
        : RouteController.store.form();
    const [distanceKm, setDistanceKm] = useState(route?.distance_km ?? '');
    const [routeGeojson, setRouteGeojson] = useState(
        route?.geojson ?? defaultGeojson ?? '',
    );
    const [positiveElevation, setPositiveElevation] = useState(
        route?.positive_elevation_m ?? '',
    );
    const [negativeElevation, setNegativeElevation] = useState(
        route?.negative_elevation_m ?? '',
    );
    const [elevationMessage, setElevationMessage] = useState<string | null>(
        null,
    );
    const [isCalculatingElevation, setIsCalculatingElevation] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState<string[]>(() =>
        defaultExperienceSelection(route?.required_experience),
    );
    const [selectedPoiIds, setSelectedPoiIds] = useState<string[]>(() =>
        (route?.poi_ids ?? []).map(String),
    );
    const [newPois, setNewPois] = useState<NewRoutePoi[]>([]);
    const [activePoiKey, setActivePoiKey] = useState<string | null>(null);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
        { name: string; url: string }[]
    >([]);
    const requiredExperience = useMemo(
        () => selectedExperience.join('\n'),
        [selectedExperience],
    );

    const toggleExperience = (value: string, checked: boolean) => {
        setSelectedExperience((current) =>
            checked
                ? [...new Set([...current, value])]
                : current.filter((item) => item !== value),
        );
    };

    const togglePoi = (id: number, checked: boolean) => {
        const value = String(id);

        setSelectedPoiIds((current) =>
            checked
                ? [...new Set([...current, value])]
                : current.filter((item) => item !== value),
        );
    };

    const addNewPoi = () => {
        setNewPois((current) => [
            ...current,
            {
                key: crypto.randomUUID(),
                name: '',
                poi_category_id: poiCategories[0]?.id
                    ? String(poiCategories[0].id)
                    : '',
                description: '',
                latitude: '',
                longitude: '',
            },
        ]);
    };

    const updateNewPoi = (
        key: string,
        field: keyof Omit<NewRoutePoi, 'key'>,
        value: string,
    ) => {
        setNewPois((current) =>
            current.map((poi) =>
                poi.key === key ? { ...poi, [field]: value } : poi,
            ),
        );
    };

    const removeNewPoi = (key: string) => {
        setNewPois((current) => current.filter((poi) => poi.key !== key));
        setActivePoiKey((current) => (current === key ? null : current));
    };

    const updateNewPoiLocation = (
        key: string,
        latitude: string,
        longitude: string,
    ) => {
        setNewPois((current) =>
            current.map((poi) =>
                poi.key === key ? { ...poi, latitude, longitude } : poi,
            ),
        );
        setActivePoiKey(null);
    };

    const previewAdditionalImages = (files: FileList | null) => {
        setAdditionalImagePreviews(
            Array.from(files ?? []).map((file) => ({
                name: file.name,
                url: URL.createObjectURL(file),
            })),
        );
    };

    const calculateElevation = useCallback(async () => {
        setElevationMessage(null);

        if (!routeGeojson) {
            setElevationMessage(
                'Dibuja el recorrido antes de calcular desnivel.',
            );

            return;
        }

        setIsCalculatingElevation(true);

        try {
            const response = await fetch('/admin/routes/elevation-preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken()
                        ? { 'X-CSRF-TOKEN': csrfToken() as string }
                        : {}),
                },
                body: JSON.stringify({ geojson: JSON.parse(routeGeojson) }),
            });

            const json = (await response.json()) as {
                positive_elevation_m?: number;
                negative_elevation_m?: number;
                sample_count?: number;
                dataset?: string;
                message?: string;
            };

            if (!response.ok) {
                throw new Error(
                    json.message ?? 'No se pudo calcular el desnivel.',
                );
            }

            setPositiveElevation(String(json.positive_elevation_m ?? 0));
            setNegativeElevation(String(json.negative_elevation_m ?? 0));
            setElevationMessage(
                `Desnivel calculado con OpenTopoData${json.dataset ? ` (${json.dataset})` : ''}${json.sample_count ? ` usando ${json.sample_count} puntos` : ''}.`,
            );
        } catch (error) {
            setElevationMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo calcular el desnivel.',
            );
        } finally {
            setIsCalculatingElevation(false);
        }
    }, [routeGeojson]);

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
                                    placeholder="Ej. Ruta Salinas de Bolívar"
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
                                    placeholder="Describe el recorrido, atractivos, tipo de terreno y recomendaciones generales."
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
                                    placeholder="Asfalto, lastre, sendero, empedrado..."
                                    required
                                    aria-invalid={Boolean(errors.road_type)}
                                />
                                <InputError message={errors.road_type} />
                            </div>

                            <div className="grid gap-3 sm:col-span-2">
                                <div className="grid gap-1">
                                    <Label>Experiencia requerida</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona una o más condiciones para
                                        evitar texto libre ambiguo.
                                    </p>
                                </div>
                                <input
                                    type="hidden"
                                    name="required_experience"
                                    value={requiredExperience}
                                />
                                <div className="grid gap-2 md:grid-cols-2">
                                    {experienceOptions.map((option) => {
                                        const checked =
                                            selectedExperience.includes(
                                                option.value,
                                            );

                                        return (
                                            <label
                                                key={option.value}
                                                className={cn(
                                                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                                                    checked
                                                        ? 'border-primary bg-primary/5'
                                                        : 'bg-card hover:bg-muted/40',
                                                )}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(value) =>
                                                        toggleExperience(
                                                            option.value,
                                                            value === true,
                                                        )
                                                    }
                                                />
                                                <span className="grid gap-1">
                                                    <span className="text-sm font-semibold">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.description}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
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
                                Dibuja el trayecto real en el mapa. El sistema
                                guarda GeoJSON LineString, inicio/final y
                                distancia trazada automáticamente.
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
                                    placeholder="Ej. Parque central de Salinas"
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
                                    placeholder="Ej. Mirador comunitario"
                                    required
                                    aria-invalid={Boolean(errors.end_name)}
                                />
                                <InputError message={errors.end_name} />
                            </div>

                            <RouteGeometryEditor
                                initialGeojson={
                                    route?.geojson ?? defaultGeojson
                                }
                                startLatitude={route?.start_latitude}
                                startLongitude={route?.start_longitude}
                                endLatitude={route?.end_latitude}
                                endLongitude={route?.end_longitude}
                                errors={errors}
                                onDistanceChange={setDistanceKm}
                                onGeojsonChange={setRouteGeojson}
                                poiDrafts={newPois}
                                activePoiKey={activePoiKey}
                                onPoiLocationChange={updateNewPoiLocation}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Métricas e imágenes</CardTitle>
                            <CardDescription>
                                La distancia se calcula desde el trazado, pero
                                puedes ajustarla si tienes una medición oficial.
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
                                value={distanceKm}
                                onChange={setDistanceKm}
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
                                placeholder="Ej. 95"
                            />

                            <NumberField
                                id="positive_elevation_m"
                                name="positive_elevation_m"
                                label="Desnivel positivo (m)"
                                value={positiveElevation}
                                onChange={setPositiveElevation}
                                error={errors.positive_elevation_m}
                                step="0.01"
                                min="0"
                                placeholder="Ej. 430.5"
                            />

                            <NumberField
                                id="negative_elevation_m"
                                name="negative_elevation_m"
                                label="Desnivel negativo (m)"
                                value={negativeElevation}
                                onChange={setNegativeElevation}
                                error={errors.negative_elevation_m}
                                step="0.01"
                                min="0"
                                placeholder="Ej. 210.25"
                            />

                            <div className="flex flex-col gap-2 rounded-2xl border border-primary/10 bg-secondary/20 p-4 sm:col-span-2">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Mountain className="mt-0.5 size-4 shrink-0" />
                                        <span>
                                            Usa OpenTopoData para calcular el
                                            desnivel desde el trazado. Puedes
                                            ajustar los valores manualmente si
                                            tienes medición oficial.
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={calculateElevation}
                                        disabled={
                                            isCalculatingElevation ||
                                            !routeGeojson
                                        }
                                    >
                                        {isCalculatingElevation
                                            ? 'Calculando...'
                                            : 'Calcular desnivel'}
                                    </Button>
                                </div>
                                {elevationMessage && (
                                    <p className="text-sm text-muted-foreground">
                                        {elevationMessage}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3 sm:col-span-2">
                                <Label htmlFor="main_image">
                                    Imagen principal
                                </Label>
                                {route?.main_image_path && (
                                    <input
                                        type="hidden"
                                        name="main_image_path"
                                        value={route.main_image_path}
                                    />
                                )}
                                {route?.main_image_path && (
                                    <div className="overflow-hidden rounded-2xl border bg-muted/30">
                                        <img
                                            src={mediaUrl(
                                                route.main_image_path,
                                            )}
                                            alt={`Imagen actual de ${route.name}`}
                                            className="h-44 w-full object-cover"
                                        />
                                    </div>
                                )}
                                <Input
                                    id="main_image"
                                    name="main_image"
                                    type="file"
                                    accept="image/*"
                                    required={
                                        !isEdit && !route?.main_image_path
                                    }
                                    aria-invalid={Boolean(
                                        errors.main_image ??
                                        errors.main_image_path,
                                    )}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Formatos de imagen. Límite: 5 MB. En
                                    edición, sube otra imagen solo si quieres
                                    reemplazar la portada.
                                </p>
                                <InputError message={errors.main_image} />
                                <InputError message={errors.main_image_path} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="additional_images">
                                    Imágenes adicionales
                                </Label>
                                <Input
                                    id="additional_images"
                                    name="additional_images[]"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(event) =>
                                        previewAdditionalImages(
                                            event.currentTarget.files,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        errors.additional_images,
                                    )}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Puedes seleccionar varias fotos del
                                    trayecto. Límite: 5 MB por archivo.
                                </p>
                                {additionalImagePreviews.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto rounded-2xl border bg-muted/20 p-3">
                                        {additionalImagePreviews.map(
                                            (image) => (
                                                <figure
                                                    key={`${image.name}-${image.url}`}
                                                    className="min-w-40 overflow-hidden rounded-xl border bg-card"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.name}
                                                        className="h-28 w-full object-cover"
                                                    />
                                                    <figcaption className="truncate p-2 text-xs text-muted-foreground">
                                                        {image.name}
                                                    </figcaption>
                                                </figure>
                                            ),
                                        )}
                                    </div>
                                )}
                                <InputError
                                    message={errors.additional_images}
                                />
                                <InputError
                                    message={errors['additional_images.0']}
                                />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="additional_images_text">
                                    Imágenes ya existentes o URLs internas
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
                            <CardTitle>Puntos de interés de la ruta</CardTitle>
                            <CardDescription>
                                Agrega aquí los lugares propios de este
                                recorrido. También puedes reutilizar POIs ya
                                registrados si aplican a varias rutas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {selectedPoiIds.map((id) => (
                                <input
                                    key={id}
                                    type="hidden"
                                    name="poi_ids[]"
                                    value={id}
                                />
                            ))}

                            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="grid gap-1">
                                        <h3 className="text-sm font-semibold">
                                            Crear puntos para esta ruta
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Marca el lugar con coordenadas. Si
                                            el POI sirve para otras rutas,
                                            quedará disponible para
                                            reutilizarlo.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addNewPoi}
                                    >
                                        <Plus data-icon="inline-start" />
                                        Agregar punto
                                    </Button>
                                </div>

                                {newPois.length === 0 && (
                                    <p className="rounded-md border bg-card p-3 text-sm text-muted-foreground">
                                        Aún no agregas puntos propios a esta
                                        ruta.
                                    </p>
                                )}

                                {newPois.map((poi, index) => (
                                    <div
                                        key={poi.key}
                                        className="grid gap-3 rounded-lg border bg-card p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <strong className="text-sm">
                                                Punto {index + 1}
                                            </strong>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeNewPoi(poi.key)
                                                }
                                                aria-label="Quitar punto"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        <input
                                            type="hidden"
                                            name={`new_pois[${index}][latitude]`}
                                            value={poi.latitude}
                                        />
                                        <input
                                            type="hidden"
                                            name={`new_pois[${index}][longitude]`}
                                            value={poi.longitude}
                                        />

                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`new_pois_${index}_name`}
                                                >
                                                    Nombre
                                                </Label>
                                                <Input
                                                    id={`new_pois_${index}_name`}
                                                    name={`new_pois[${index}][name]`}
                                                    value={poi.name}
                                                    onChange={(event) =>
                                                        updateNewPoi(
                                                            poi.key,
                                                            'name',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Ej. Mirador del valle"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `new_pois.${index}.name`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`new_pois_${index}_category`}
                                                >
                                                    Categoría
                                                </Label>
                                                <Select
                                                    name={`new_pois[${index}][poi_category_id]`}
                                                    value={poi.poi_category_id}
                                                    onValueChange={(value) =>
                                                        updateNewPoi(
                                                            poi.key,
                                                            'poi_category_id',
                                                            value,
                                                        )
                                                    }
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id={`new_pois_${index}_category`}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Selecciona categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {poiCategories.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={String(
                                                                            category.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors[
                                                            `new_pois.${index}.poi_category_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2 md:col-span-2">
                                                <Button
                                                    type="button"
                                                    variant={
                                                        activePoiKey === poi.key
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        setActivePoiKey(poi.key)
                                                    }
                                                >
                                                    <MapPin data-icon="inline-start" />
                                                    {poi.latitude &&
                                                    poi.longitude
                                                        ? 'Cambiar ubicación en mapa'
                                                        : 'Marcar ubicación en mapa'}
                                                </Button>
                                                <p className="text-xs text-muted-foreground">
                                                    {poi.latitude &&
                                                    poi.longitude
                                                        ? `Ubicado en ${Number(poi.latitude).toFixed(5)}, ${Number(poi.longitude).toFixed(5)}`
                                                        : 'Pulsa el botón y toca el mapa para ubicar este punto.'}
                                                </p>
                                                <InputError
                                                    message={
                                                        errors[
                                                            `new_pois.${index}.latitude`
                                                        ] ??
                                                        errors[
                                                            `new_pois.${index}.longitude`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2 md:col-span-2">
                                                <Label
                                                    htmlFor={`new_pois_${index}_description`}
                                                >
                                                    Descripción opcional
                                                </Label>
                                                <Input
                                                    id={`new_pois_${index}_description`}
                                                    name={`new_pois[${index}][description]`}
                                                    value={poi.description}
                                                    onChange={(event) =>
                                                        updateNewPoi(
                                                            poi.key,
                                                            'description',
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Detalle breve visible para el ciclista"
                                                />
                                                <InputError
                                                    message={
                                                        errors[
                                                            `new_pois.${index}.description`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    <h3 className="text-sm font-semibold">
                                        Reutilizar puntos existentes
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Úsalo solo cuando el lugar ya exista y
                                        pertenezca también a esta ruta.
                                    </p>
                                </div>

                                {pois.length > 0 ? (
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {pois.map((poi) => {
                                            const checked =
                                                selectedPoiIds.includes(
                                                    String(poi.id),
                                                );

                                            return (
                                                <label
                                                    key={poi.id}
                                                    className={cn(
                                                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                                                        checked
                                                            ? 'border-primary bg-primary/5'
                                                            : 'bg-card hover:bg-muted/40',
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(
                                                            value,
                                                        ) =>
                                                            togglePoi(
                                                                poi.id,
                                                                value === true,
                                                            )
                                                        }
                                                    />
                                                    <span className="grid gap-1">
                                                        <span className="text-sm font-semibold">
                                                            {poi.name}
                                                        </span>
                                                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {poi.category
                                                                ?.name ??
                                                                'Sin categoría'}
                                                            <span>
                                                                {poi.latitude.toFixed(
                                                                    5,
                                                                )}
                                                                ,{' '}
                                                                {poi.longitude.toFixed(
                                                                    5,
                                                                )}
                                                            </span>
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Alert>
                                        <MapPin />
                                        <AlertTitle>
                                            No hay puntos reutilizables
                                        </AlertTitle>
                                        <AlertDescription>
                                            Puedes crear los puntos propios de
                                            esta ruta en la sección superior.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <InputError message={errors.poi_ids} />
                            <InputError message={errors['poi_ids.0']} />
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
                                    placeholder={
                                        'Llevar hidratación\nUsar casco y luces\nRevisar frenos antes de iniciar'
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
                                    placeholder={
                                        'Tramo con neblina frecuente\nEvitar lluvia intensa'
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
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ImageIcon className="size-4" />
                                    La ruta iniciará en versión 1.
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/admin/routes" prefetch>
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button
                                    disabled={processing || !requiredExperience}
                                >
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
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    min?: string;
    step?: string;
    placeholder?: string;
};

function NumberField({
    id,
    name,
    label,
    defaultValue,
    value,
    onChange,
    error,
    min,
    step = 'any',
    placeholder,
}: NumberFieldProps) {
    const controlled = value !== undefined;

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type="number"
                min={min}
                step={step}
                value={controlled ? value : undefined}
                defaultValue={controlled ? undefined : (defaultValue ?? '')}
                onChange={
                    controlled
                        ? (event) => onChange?.(event.currentTarget.value)
                        : undefined
                }
                placeholder={placeholder}
                required
                aria-invalid={Boolean(error)}
            />
            <InputError message={error} />
        </div>
    );
}

function defaultExperienceSelection(current?: string | null): string[] {
    if (!current) {
        return ['Requiere experiencia media y bicicleta en buen estado.'];
    }

    const normalized = current.toLocaleLowerCase();
    const selected = experienceOptions
        .filter((option) =>
            option.keywords.some((keyword) => normalized.includes(keyword)),
        )
        .map((option) => option.value);

    return selected.length > 0
        ? selected
        : ['Requiere experiencia media y bicicleta en buen estado.'];
}

function csrfToken(): string | null {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? null
    );
}
