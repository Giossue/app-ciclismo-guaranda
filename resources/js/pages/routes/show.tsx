import { Form, Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Database,
    Download,
    ImageIcon,
    LocateFixed,
    Heart,
    HeartOff,
    MapPinned,
    MessageSquareText,
    RefreshCw,
    Send,
    Star,
    Trash2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
    CircleMarker,
    MapContainer,
    TileLayer,
    useMapEvents,
} from 'react-leaflet';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import IncidentController from '@/actions/App/Http/Controllers/Cyclist/IncidentController';
import OfflineRouteController from '@/actions/App/Http/Controllers/Cyclist/OfflineRouteController';
import PoiReportController from '@/actions/App/Http/Controllers/Cyclist/PoiReportController';
import PoiSuggestionController from '@/actions/App/Http/Controllers/Cyclist/PoiSuggestionController';
import RouteRatingController from '@/actions/App/Http/Controllers/Cyclist/RouteRatingController';
import TrackController from '@/actions/App/Http/Controllers/Cyclist/TrackController';
import ImageFileInput from '@/components/image-file-input';
import ImageGallery from '@/components/image-gallery';
import type { GalleryImage } from '@/components/image-gallery';
import InputError from '@/components/input-error';
import { MobileTabs } from '@/components/mobile-tabs';
import RouteMap from '@/components/routes/route-map';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Separator } from '@/components/ui/separator';
import { mediaUrl } from '@/lib/media';
import {
    deleteOfflineRoute,
    enqueueOfflineEvent,
    estimateOfflineStorage,
    getOfflineRoute,
    listQueueItems,
    saveOfflineRoute,
} from '@/lib/offline/local-database';
import type {
    OfflineRoutePackage,
    OfflineRouteRecord,
} from '@/lib/offline/local-database';
import { syncPendingOfflineEvents } from '@/lib/offline/sync-client';
import type {
    ActiveTrack,
    CatalogOption,
    CyclingRouteMapItem,
    RoutePoi,
    RouteRating,
} from '@/types';

type Props = {
    route: CyclingRouteMapItem;
    poiCategories: CatalogOption[];
    incidentTypes: CatalogOption[];
    activeTrack: ActiveTrack | null;
};

const textareaClass =
    'min-h-24 w-full rounded-2xl border border-input bg-card px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export default function RoutesShow({
    route,
    poiCategories,
    incidentTypes,
    activeTrack,
}: Props) {
    return (
        <>
            <Head title={route.name} />

            <div className="flex flex-col gap-4">
                <RouteHeader route={route} />

                <MobileTabs
                    defaultValue="map"
                    items={[
                        {
                            value: 'map',
                            label: 'Mapa',
                            content: (
                                <div className="flex flex-col gap-3">
                                    {route.incidents.length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertTriangle />
                                            <AlertTitle>
                                                Revisa las alertas
                                            </AlertTitle>
                                            <AlertDescription>
                                                Hay reportes visibles en esta
                                                ruta.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <Card className="overflow-hidden">
                                        <CardHeader>
                                            <CardTitle>Mapa</CardTitle>
                                            <CardDescription>
                                                Trazado, inicio, final y puntos
                                                útiles.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RouteMap
                                                routes={[route]}
                                                selectedSlug={route.slug}
                                                mode="detail"
                                                activeTrack={activeTrack}
                                                className="[&_.leaflet-container]:h-[calc(100svh-280px)] [&_.leaflet-container]:min-h-96 md:[&_.leaflet-container]:h-[560px]"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            ),
                        },
                        {
                            value: 'route',
                            label: 'Ruta',
                            content: (
                                <div className="flex flex-col gap-3">
                                    <RouteDetailPanel route={route} />
                                    <TrackPanel
                                        route={route}
                                        activeTrack={activeTrack}
                                    />
                                </div>
                            ),
                        },
                        {
                            value: 'pois',
                            label: 'POIs',
                            badge: route.points_of_interest.length,
                            content: (
                                <div className="flex flex-col gap-3">
                                    <PoisPanel route={route} />
                                    <PoiSuggestionForm
                                        route={route}
                                        categories={poiCategories}
                                    />
                                </div>
                            ),
                        },
                        {
                            value: 'reports',
                            label: 'Reportar',
                            badge: route.incidents.length || null,
                            content: (
                                <div className="flex flex-col gap-3">
                                    <IncidentReportForm
                                        route={route}
                                        types={incidentTypes}
                                    />
                                    {route.incidents.length > 0 && (
                                        <IncidentsPanel route={route} />
                                    )}
                                </div>
                            ),
                        },
                        {
                            value: 'ratings',
                            label: 'Opiniones',
                            badge: route.approved_ratings.length || null,
                            content: <FavoriteRatingPanel route={route} />,
                        },
                        {
                            value: 'offline',
                            label: 'Sin conexión',
                            content: (
                                <OfflinePanel
                                    route={route}
                                    incidentTypes={incidentTypes}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}

function RouteDetailPanel({ route }: { route: CyclingRouteMapItem }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalle</CardTitle>
                <CardDescription>{route.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-2">
                        <MapPinned />
                        <span>Inicio: {route.start_name}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-2">
                        <MapPinned />
                        <span>Final: {route.end_name}</span>
                    </div>
                    {route.metric && (
                        <>
                            <Metric
                                label="Distancia"
                                value={`${route.metric.distance_km.toLocaleString()} km`}
                            />
                            <Metric
                                label="Tiempo"
                                value={`${route.metric.estimated_time_minutes} min`}
                            />
                            <Metric
                                label="Desnivel"
                                value={`+${route.metric.positive_elevation_m?.toLocaleString() ?? 0} m / -${route.metric.negative_elevation_m?.toLocaleString() ?? 0} m`}
                            />
                        </>
                    )}
                </div>

                <Separator />

                <InfoList
                    title="Recomendaciones"
                    items={route.recommendations}
                />
                <InfoList title="Observaciones" items={route.observations} />
            </CardContent>
        </Card>
    );
}

function PoisPanel({ route }: { route: CyclingRouteMapItem }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Puntos útiles</CardTitle>
                <CardDescription>
                    Lugares y servicios vinculados al recorrido.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {route.points_of_interest.map((poi) => (
                    <PoiCard key={poi.id} poi={poi} />
                ))}

                {route.points_of_interest.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Esta ruta aún no tiene puntos útiles.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function IncidentsPanel({ route }: { route: CyclingRouteMapItem }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Alertas de la ruta</CardTitle>
                <CardDescription>
                    Puntos reportados por ciclistas para manejar con precaución.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
                {route.incidents.map((incident) => (
                    <div
                        key={incident.id}
                        className="flex flex-col gap-1 rounded-2xl border bg-card p-3"
                    >
                        <div className="flex flex-wrap gap-2">
                            {incident.type && (
                                <Badge variant="destructive">
                                    {incident.type.name}
                                </Badge>
                            )}
                        </div>
                        <strong>{incident.title}</strong>
                        <p className="text-sm text-muted-foreground">
                            {incident.description}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function RouteHeader({ route }: { route: CyclingRouteMapItem }) {
    const placeholder = (
        <div className="flex min-h-52 items-center justify-center bg-muted text-muted-foreground md:min-h-72">
            <div className="flex flex-col items-center gap-2 text-center">
                <ImageIcon className="size-8" />
                <span className="text-sm font-medium">Ruta sin portada</span>
            </div>
        </div>
    );

    const images: GalleryImage[] =
        route.gallery.length > 0
            ? route.gallery.map((image) => ({
                  src: mediaUrl(image.image_path),
                  alt: route.name,
                  description: image.description,
              }))
            : route.main_image_path
              ? [{ src: mediaUrl(route.main_image_path), alt: route.name }]
              : [];

    return (
        <Card className="overflow-hidden">
            <div className="relative">
                <ImageGallery
                    images={images}
                    slideClassName="h-52 md:h-72"
                    fallback={placeholder}
                />
                <Button
                    asChild
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 left-3 z-[5] size-9 rounded-full border border-border/60 bg-background/85 shadow-sm backdrop-blur-sm hover:bg-background"
                >
                    <Link href="/routes" prefetch aria-label="Volver a rutas">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-2 p-4">
                <h1 className="text-xl font-black tracking-tight text-foreground">
                    {route.name}
                </h1>
                <p className="text-sm font-semibold text-muted-foreground">
                    {route.start_name} → {route.end_name}
                </p>
                <div className="flex flex-wrap gap-2">
                    {route.category && (
                        <Badge variant="outline">{route.category.name}</Badge>
                    )}
                    {route.difficulty && (
                        <Badge variant="secondary">
                            {route.difficulty.name}
                        </Badge>
                    )}
                    {route.incidents.length > 0 && (
                        <Badge variant="destructive">
                            {route.incidents.length} alerta
                            {route.incidents.length === 1 ? '' : 's'}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}

function TrackPanel({
    route,
    activeTrack,
}: {
    route: CyclingRouteMapItem;
    activeTrack: ActiveTrack | null;
}) {
    const isInProgress = activeTrack?.status?.name === 'en curso';
    const isPaused = activeTrack?.status?.name === 'pausado';
    const hasActiveTrack = activeTrack !== null && (isInProgress || isPaused);
    const isPostingPoint = useRef(false);
    const [startMessage, setStartMessage] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const startThresholdMeters = 150;

    const capturePoint = useCallback(() => {
        if (!activeTrack || !isInProgress || !navigator.geolocation) {
            return;
        }

        if (isPostingPoint.current) {
            return;
        }

        isPostingPoint.current = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(
                    TrackController.point.url(activeTrack.id),
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        elevation_m: position.coords.altitude,
                        speed_kmh:
                            position.coords.speed === null
                                ? null
                                : position.coords.speed * 3.6,
                        accuracy_m: position.coords.accuracy,
                        recorded_at: new Date().toISOString(),
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onFinish: () => {
                            isPostingPoint.current = false;
                        },
                    },
                );
            },
            () => {
                isPostingPoint.current = false;
            },
            { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
        );
    }, [activeTrack, isInProgress]);

    const startTrack = useCallback(() => {
        setStartMessage(null);

        if (!navigator.geolocation) {
            setStartMessage(
                'Tu dispositivo no soporta geolocalización. No se puede iniciar el recorrido sin ubicación.',
            );

            return;
        }

        setIsStarting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const distance = distanceMeters(
                    position.coords.latitude,
                    position.coords.longitude,
                    route.start_latitude,
                    route.start_longitude,
                );

                if (distance > startThresholdMeters) {
                    setStartMessage(
                        `Debes acercarte al punto de partida para iniciar. Distancia aproximada: ${Math.round(distance)} m.`,
                    );
                    setIsStarting(false);

                    return;
                }

                router.post(
                    TrackController.store.url(route.slug),
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy_m: position.coords.accuracy,
                    },
                    {
                        preserveScroll: true,
                        onError: (errors) => {
                            setStartMessage(
                                errors.route ??
                                    'No se pudo iniciar el recorrido con tu ubicación actual.',
                            );
                        },
                        onFinish: () => setIsStarting(false),
                    },
                );
            },
            () => {
                setStartMessage(
                    'Activa el permiso de ubicación precisa para iniciar el recorrido desde el punto de partida.',
                );
                setIsStarting(false);
            },
            { enableHighAccuracy: true, maximumAge: 15_000, timeout: 15_000 },
        );
    }, [route.slug, route.start_latitude, route.start_longitude]);

    useEffect(() => {
        if (!isInProgress || !activeTrack) {
            return;
        }

        const interval = window.setInterval(capturePoint, 60_000);

        return () => window.clearInterval(interval);
    }, [activeTrack, capturePoint, isInProgress]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Recorrido GPS</CardTitle>
                        <CardDescription>
                            Para iniciar debes estar cerca del punto de partida.
                            Usa los controles para iniciar, pausar o finalizar.
                        </CardDescription>
                    </div>
                    {hasActiveTrack && activeTrack.status && (
                        <Badge variant={isInProgress ? 'secondary' : 'outline'}>
                            {activeTrack.status.name}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {startMessage && (
                    <Alert>
                        <MapPinned />
                        <AlertTitle>Acércate al inicio de la ruta</AlertTitle>
                        <AlertDescription>{startMessage}</AlertDescription>
                    </Alert>
                )}

                {hasActiveTrack ? (
                    <>
                        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
                            <Metric
                                label="Distancia"
                                value={`${activeTrack.distance_traveled_km.toLocaleString()} km`}
                            />
                            <Metric
                                label="Avance"
                                value={`${activeTrack.completion_percentage.toLocaleString()}%`}
                            />
                            <Metric
                                label="Puntos"
                                value={String(activeTrack.gps_points_count)}
                            />
                            <Metric
                                label="Válido"
                                value={activeTrack.is_valid ? 'Sí' : 'No'}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {isInProgress && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={capturePoint}
                                    >
                                        Registrar punto GPS ahora
                                    </Button>
                                    <Form
                                        {...TrackController.pause.form(
                                            activeTrack.id,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                            >
                                                Pausar
                                            </Button>
                                        )}
                                    </Form>
                                </>
                            )}

                            {isPaused && (
                                <Form
                                    {...TrackController.resume.form(
                                        activeTrack.id,
                                    )}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <Button
                                            variant="outline"
                                            disabled={processing}
                                        >
                                            Reanudar
                                        </Button>
                                    )}
                                </Form>
                            )}

                            {(isInProgress || isPaused) && (
                                <>
                                    <Form
                                        {...TrackController.finish.form(
                                            activeTrack.id,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button disabled={processing}>
                                                Finalizar
                                            </Button>
                                        )}
                                    </Form>
                                    <Form
                                        {...TrackController.cancel.form(
                                            activeTrack.id,
                                        )}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                    </Form>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground">
                            Comprobaremos tu ubicación antes de iniciar.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                disabled={isStarting}
                                onClick={startTrack}
                            >
                                {isStarting
                                    ? 'Verificando ubicación...'
                                    : 'Iniciar recorrido'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function distanceMeters(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
): number {
    const earthRadiusMeters = 6371000;
    const latitudeDelta = degreesToRadians(toLatitude - fromLatitude);
    const longitudeDelta = degreesToRadians(toLongitude - fromLongitude);
    const fromLat = degreesToRadians(fromLatitude);
    const toLat = degreesToRadians(toLatitude);
    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(longitudeDelta / 2) ** 2;

    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border bg-muted/30 p-3">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    );
}

function FavoriteRatingPanel({ route }: { route: CyclingRouteMapItem }) {
    const userRating = route.user_interaction.rating;
    const [isCompressing, setIsCompressing] = useState(false);
    const ratingAction = userRating
        ? RouteRatingController.update.form(userRating.id)
        : RouteRatingController.store.form(route.slug);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Favoritos y valoración</CardTitle>
                        <CardDescription>
                            Guarda esta ruta y comparte tu experiencia cuando
                            hayas completado un recorrido válido.
                        </CardDescription>
                    </div>
                    <Badge variant="outline">
                        <Star data-icon="inline-start" />
                        {route.rating_summary.average_rating === null
                            ? 'Sin valoraciones'
                            : `${route.rating_summary.average_rating.toLocaleString()} (${route.rating_summary.approved_count})`}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <div className="flex flex-col gap-3">
                    {route.user_interaction.is_favorite ? (
                        <Form
                            {...FavoriteRouteController.destroy.form(
                                route.slug,
                            )}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <HeartOff data-icon="inline-start" />
                                    Quitar de favoritas
                                </Button>
                            )}
                        </Form>
                    ) : (
                        <Form
                            {...FavoriteRouteController.store.form(route.slug)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    <Heart data-icon="inline-start" />
                                    Guardar favorita
                                </Button>
                            )}
                        </Form>
                    )}

                    <div className="rounded-2xl border bg-muted/30 p-3 text-sm text-muted-foreground">
                        <p>
                            Recorridos válidos para valorar:{' '}
                            <strong className="text-foreground">
                                {route.user_interaction.valid_tracks_count}
                            </strong>
                        </p>
                        <p>
                            Solo cuentan recorridos finalizados con al menos 90%
                            de avance.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {route.user_interaction.can_rate ? (
                        <Form
                            {...ratingAction}
                            options={{ preserveScroll: true }}
                            encType="multipart/form-data"
                            className="grid gap-3 rounded-2xl border border-primary/10 bg-muted/30 p-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2 sm:max-w-48">
                                        <Label htmlFor="rating">
                                            Calificación
                                        </Label>
                                        <Select
                                            name="rating"
                                            defaultValue={
                                                userRating
                                                    ? String(userRating.rating)
                                                    : undefined
                                            }
                                            required
                                        >
                                            <SelectTrigger
                                                id="rating"
                                                className="w-full"
                                                aria-invalid={Boolean(
                                                    errors.rating,
                                                )}
                                            >
                                                <SelectValue placeholder="1 a 5" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {[1, 2, 3, 4, 5].map(
                                                        (value) => (
                                                            <SelectItem
                                                                key={value}
                                                                value={String(
                                                                    value,
                                                                )}
                                                            >
                                                                {value} estrella
                                                                {value === 1
                                                                    ? ''
                                                                    : 's'}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.rating} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="rating_comment">
                                            Comentario
                                        </Label>
                                        <textarea
                                            id="rating_comment"
                                            name="comment"
                                            defaultValue={
                                                userRating?.comment ?? ''
                                            }
                                            className={textareaClass}
                                            placeholder="Cuenta cómo estuvo la ruta, señalización, seguridad o puntos útiles"
                                            aria-invalid={Boolean(
                                                errors.comment,
                                            )}
                                        />
                                        <InputError message={errors.comment} />
                                        <InputError message={errors.route} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="rating_media">
                                            Fotos o videos de tu experiencia
                                        </Label>
                                        <ImageFileInput
                                            id="rating_media"
                                            name="media[]"
                                            accept="image/*,video/mp4,video/quicktime,video/webm"
                                            multiple
                                            maxFiles={4}
                                            invalid={Boolean(errors.media)}
                                            onProcessingChange={
                                                setIsCompressing
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Hasta 4 archivos. Las fotos se
                                            optimizan a 5 MB o menos; los videos
                                            (MP4, MOV o WebM) admiten hasta 20
                                            MB.
                                        </p>
                                        <InputError message={errors.media} />
                                        <InputError
                                            message={errors['media.0']}
                                        />
                                    </div>

                                    {userRating?.status && (
                                        <Alert>
                                            <MessageSquareText />
                                            <AlertTitle>
                                                Tu valoración:{' '}
                                                {userRating.status.name}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {userRating.admin_response ??
                                                    'Tu comentario aparecerá cuando esté listo.'}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            disabled={
                                                processing || isCompressing
                                            }
                                        >
                                            <Send data-icon="inline-start" />
                                            {userRating
                                                ? 'Actualizar valoración'
                                                : 'Enviar valoración'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    ) : (
                        <Alert>
                            <MessageSquareText />
                            <AlertTitle>
                                Completa la ruta para valorarla
                            </AlertTitle>
                            <AlertDescription>
                                Necesitas un recorrido finalizado y válido antes
                                de enviar una valoración.
                            </AlertDescription>
                        </Alert>
                    )}

                    {userRating && (
                        <Form
                            {...RouteRatingController.destroy.form(
                                userRating.id,
                            )}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    <Trash2 data-icon="inline-start" />
                                    Eliminar mi valoración
                                </Button>
                            )}
                        </Form>
                    )}

                    <Separator />

                    <div className="flex flex-col gap-3">
                        <h3 className="font-medium">Comentarios</h3>
                        {route.approved_ratings.map((rating) => (
                            <div
                                key={rating.id}
                                className="rounded-2xl border bg-card p-3"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        ★ {rating.rating}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {rating.user?.name ?? 'Ciclista'}
                                    </span>
                                </div>
                                {rating.comment && (
                                    <p className="mt-2 text-sm">
                                        {rating.comment}
                                    </p>
                                )}
                                <RatingMediaGrid rating={rating} />
                            </div>
                        ))}

                        {route.approved_ratings.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay comentarios para esta ruta.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RatingMediaGrid({ rating }: { rating: RouteRating }) {
    if (rating.files.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {rating.files.map((file) =>
                file.file_type === 'video' ? (
                    <video
                        key={file.id}
                        src={mediaUrl(file.file_path)}
                        controls
                        className="h-40 w-full rounded-xl border object-cover"
                    />
                ) : (
                    <img
                        key={file.id}
                        src={mediaUrl(file.file_path)}
                        alt="Evidencia de experiencia de ruta"
                        className="h-40 w-full rounded-xl border object-cover"
                    />
                ),
            )}
        </div>
    );
}

function OfflinePanel({
    route,
    incidentTypes,
}: {
    route: CyclingRouteMapItem;
    incidentTypes: CatalogOption[];
}) {
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
    const [downloadedRoute, setDownloadedRoute] =
        useState<OfflineRouteRecord | null>(null);
    const [queueCount, setQueueCount] = useState(0);
    const [storageEstimate, setStorageEstimate] =
        useState<StorageEstimate | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);

    const loadOfflineState = useCallback(async () => {
        const [record, items, estimate] = await Promise.all([
            getOfflineRoute(route.slug),
            listQueueItems(),
            estimateOfflineStorage(),
        ]);

        setDownloadedRoute(record ?? null);
        setQueueCount(
            items.filter(
                (item) =>
                    item.status === 'pendiente' || item.status === 'error',
            ).length,
        );
        setStorageEstimate(estimate);
    }, [route.slug]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadOfflineState();
        }, 0);

        const updateOnlineState = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', updateOnlineState);
        window.addEventListener('offline', updateOnlineState);

        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener('online', updateOnlineState);
            window.removeEventListener('offline', updateOnlineState);
        };
    }, [loadOfflineState]);

    const downloadRoute = async () => {
        setIsBusy(true);
        setMessage(null);

        try {
            const packageResponse = await fetch(
                OfflineRouteController.show.url(route.slug),
                { headers: { Accept: 'application/json' } },
            );

            if (!packageResponse.ok) {
                throw new Error('No se pudo obtener el paquete offline.');
            }

            const pack = (await packageResponse.json()) as OfflineRoutePackage;
            await saveOfflineRoute(pack);

            const sizeMb =
                new Blob([JSON.stringify(pack)]).size / (1024 * 1024);

            await fetch(OfflineRouteController.store.url(route.slug), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken()
                        ? { 'X-CSRF-TOKEN': csrfToken() as string }
                        : {}),
                },
                body: JSON.stringify({
                    download_status: 'completada',
                    size_mb: Math.round(sizeMb * 100) / 100,
                }),
            });

            setMessage('Ruta descargada localmente para uso sin conexión.');
            await loadOfflineState();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo descargar la ruta.',
            );
        } finally {
            setIsBusy(false);
        }
    };

    const removeDownload = async () => {
        setIsBusy(true);
        setMessage(null);

        try {
            await deleteOfflineRoute(route.slug);
            await fetch(OfflineRouteController.store.url(route.slug), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken()
                        ? { 'X-CSRF-TOKEN': csrfToken() as string }
                        : {}),
                },
                body: JSON.stringify({ download_status: 'eliminada' }),
            });
            setMessage('Descarga local eliminada de este dispositivo.');
            await loadOfflineState();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo eliminar la descarga local.',
            );
        } finally {
            setIsBusy(false);
        }
    };

    const syncQueue = async () => {
        setIsBusy(true);
        setMessage(null);

        try {
            const results = await syncPendingOfflineEvents();
            const sentCount = results.filter(
                (result) => result.status === 'enviado',
            ).length;

            setMessage(
                results.length === 0
                    ? 'No hay datos pendientes.'
                    : `${sentCount} de ${results.length} dato(s) sincronizado(s).`,
            );
            await loadOfflineState();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo sincronizar.',
            );
            await loadOfflineState();
        } finally {
            setIsBusy(false);
        }
    };

    const enqueueIncident = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsBusy(true);
        setMessage(null);

        const form = event.currentTarget;
        const data = new FormData(form);

        try {
            await enqueueOfflineEvent('offline_incident_reported', {
                route_id: route.id,
                incident_type_id: Number(data.get('incident_type_id')),
                title: String(data.get('title') ?? ''),
                description: String(data.get('description') ?? ''),
                latitude: Number(data.get('latitude')),
                longitude: Number(data.get('longitude')),
                reported_at: new Date().toISOString(),
            });
            form.reset();
            setMessage('Alerta guardada en este dispositivo.');
            await loadOfflineState();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo guardar la alerta.',
            );
        } finally {
            setIsBusy(false);
        }
    };

    const enqueueCompletedTrack = async () => {
        setIsBusy(true);
        setMessage(null);

        try {
            const startedAt = new Date(Date.now() - 60 * 60 * 1000);
            const endedAt = new Date();

            await enqueueOfflineEvent('offline_track_completed', {
                route_id: route.id,
                started_at: startedAt.toISOString(),
                ended_at: endedAt.toISOString(),
                points: [
                    {
                        latitude: route.start_latitude,
                        longitude: route.start_longitude,
                        recorded_at: startedAt.toISOString(),
                    },
                    {
                        latitude: route.end_latitude,
                        longitude: route.end_longitude,
                        recorded_at: endedAt.toISOString(),
                    },
                ],
            });
            setMessage('Recorrido guardado para sincronizar.');
            await loadOfflineState();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo guardar el recorrido.',
            );
        } finally {
            setIsBusy(false);
        }
    };

    const downloadedVersion = downloadedRoute?.route_version ?? null;
    const isOutdated =
        downloadedVersion !== null && downloadedVersion < route.route_version;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Uso sin conexión</CardTitle>
                        <CardDescription>
                            Descarga la ruta y sincroniza tus datos cuando
                            recuperes conexión.
                        </CardDescription>
                    </div>
                    <Badge variant={isOnline ? 'secondary' : 'outline'}>
                        {isOnline ? <Wifi /> : <WifiOff />}
                        {isOnline ? 'En línea' : 'Sin conexión'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <Metric
                        label="Descarga"
                        value={
                            downloadedRoute
                                ? `v${downloadedRoute.route_version}${isOutdated ? ' desactualizada' : ''}`
                                : 'No descargada'
                        }
                    />
                    <Metric label="Pendiente" value={String(queueCount)} />
                    <Metric
                        label="Almacenamiento"
                        value={formatStorageEstimate(storageEstimate)}
                    />
                </div>

                {isOutdated && (
                    <Alert>
                        <AlertTriangle />
                        <AlertTitle>Ruta descargada desactualizada</AlertTitle>
                        <AlertDescription>
                            Vuelve a descargarla para tener la versión oficial v
                            {route.route_version}.
                        </AlertDescription>
                    </Alert>
                )}

                {message && (
                    <Alert>
                        <Database />
                        <AlertTitle>Estado</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        onClick={downloadRoute}
                        disabled={isBusy}
                    >
                        <Download />
                        Descargar ruta
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={loadOfflineState}
                        disabled={isBusy}
                    >
                        <RefreshCw />
                        Verificar estado
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={syncQueue}
                        disabled={isBusy || !isOnline}
                    >
                        Sincronizar
                    </Button>
                    {downloadedRoute && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={removeDownload}
                            disabled={isBusy}
                        >
                            Eliminar descarga
                        </Button>
                    )}
                </div>

                <Separator />

                <div className="grid gap-4 lg:grid-cols-2">
                    <form
                        onSubmit={enqueueIncident}
                        className="grid gap-3 rounded-2xl border border-primary/10 bg-muted/30 p-4"
                    >
                        <div>
                            <h3 className="font-medium">Alerta sin conexión</h3>
                            <p className="text-sm text-muted-foreground">
                                Se enviará cuando recuperes conexión.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="offline_incident_type_id">
                                Tipo de incidencia
                            </Label>
                            <Select name="incident_type_id" required>
                                <SelectTrigger
                                    id="offline_incident_type_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Selecciona tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {incidentTypes.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={String(type.id)}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <Input
                            name="title"
                            required
                            placeholder="Título de la incidencia"
                        />
                        <textarea
                            name="description"
                            required
                            className={textareaClass}
                            placeholder="Describe el problema"
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                name="latitude"
                                type="number"
                                step="any"
                                required
                                defaultValue={route.start_latitude}
                            />
                            <Input
                                name="longitude"
                                type="number"
                                step="any"
                                required
                                defaultValue={route.start_longitude}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isBusy}
                        >
                            Guardar alerta
                        </Button>
                    </form>

                    <div className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-muted/30 p-4">
                        <div>
                            <h3 className="font-medium">Recorrido offline</h3>
                            <p className="text-sm text-muted-foreground">
                                Guarda un recorrido en este dispositivo para
                                enviarlo cuando tengas conexión.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={enqueueCompletedTrack}
                            disabled={isBusy}
                        >
                            Guardar recorrido sin conexión
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function csrfToken(): string | null {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? null
    );
}

function formatStorageEstimate(estimate: StorageEstimate | null): string {
    if (!estimate?.quota) {
        return 'No disponible';
    }

    const usageMb = ((estimate.usage ?? 0) / (1024 * 1024)).toFixed(1);
    const quotaMb = (estimate.quota / (1024 * 1024)).toFixed(0);

    return `${usageMb} / ${quotaMb} MB`;
}

function PoiCard({ poi }: { poi: RoutePoi }) {
    const images: GalleryImage[] = (poi.images ?? []).map((image) => ({
        src: mediaUrl(image.image_path),
        alt: image.description ?? poi.name,
        description: image.description,
    }));

    return (
        <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card">
            {images.length > 0 && (
                <ImageGallery
                    images={images}
                    variant="thumbnails"
                    className="p-3 pb-0"
                />
            )}
            <div className="flex flex-col gap-1 p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <strong>{poi.name}</strong>
                    {poi.is_required && (
                        <Badge variant="secondary">
                            <Star data-icon="inline-start" />
                            clave
                        </Badge>
                    )}
                </div>
                {poi.category && (
                    <span className="text-sm text-muted-foreground">
                        {poi.category.name}
                    </span>
                )}
                {poi.distance_from_start_km !== null && (
                    <span className="text-sm text-muted-foreground">
                        Km {poi.distance_from_start_km.toLocaleString()}
                    </span>
                )}
                {poi.address && (
                    <span className="text-sm text-muted-foreground">
                        {poi.address}
                    </span>
                )}
                {poi.phone && (
                    <span className="text-sm text-muted-foreground">
                        Tel. {poi.phone}
                    </span>
                )}
            </div>

            {poi.description && (
                <p className="px-3 text-sm text-muted-foreground">
                    {poi.description}
                </p>
            )}

            {poi.hours && poi.hours.length > 0 && (
                <div className="flex flex-col gap-1 px-3 text-sm text-muted-foreground">
                    {poi.hours.map((hour) => (
                        <span key={`${poi.id}-${hour.weekday}`}>
                            Día {hour.weekday}: {hour.opens_at ?? '--'}-
                            {hour.closes_at ?? '--'} {hour.description ?? ''}
                        </span>
                    ))}
                </div>
            )}

            <div className="p-3 pt-0">
                <PoiReportForm poiId={poi.id} />
            </div>
        </div>
    );
}

function PoiReportForm({ poiId }: { poiId: number }) {
    return (
        <Form
            {...PoiReportController.store.form(poiId)}
            options={{ preserveScroll: true }}
            className="grid gap-2 rounded-2xl bg-muted/30 p-3"
        >
            {({ processing, errors }) => (
                <>
                    <Label htmlFor={`report_type_${poiId}`}>
                        Reportar punto
                    </Label>
                    <Select
                        name="report_type"
                        defaultValue="datos incorrectos"
                        required
                    >
                        <SelectTrigger
                            id={`report_type_${poiId}`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Tipo de reporte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="cerrado">Cerrado</SelectItem>
                                <SelectItem value="datos incorrectos">
                                    Datos incorrectos
                                </SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.report_type} />

                    <textarea
                        name="description"
                        className={textareaClass}
                        placeholder="Describe el problema encontrado"
                        aria-invalid={Boolean(errors.description)}
                    />
                    <InputError message={errors.description} />

                    <Button size="sm" disabled={processing}>
                        Enviar
                    </Button>
                </>
            )}
        </Form>
    );
}

function PoiSuggestionForm({
    route,
    categories,
}: {
    route: CyclingRouteMapItem;
    categories: CatalogOption[];
}) {
    const [selectedPoint, setSelectedPoint] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const selectedCategoryName =
        categories
            .find((category) => String(category.id) === selectedCategoryId)
            ?.name.toLocaleLowerCase() ?? '';

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            setSelectedPoint({
                latitude: Number(position.coords.latitude.toFixed(7)),
                longitude: Number(position.coords.longitude.toFixed(7)),
            });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sugerir un punto de interés</CardTitle>
                <CardDescription>
                    Selecciona el punto en el mapa o usa tu ubicación actual. No
                    necesitas escribir coordenadas manualmente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form
                    {...PoiSuggestionController.store.form()}
                    options={{ preserveScroll: true }}
                    className="grid gap-4 md:grid-cols-2"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="latitude"
                                value={selectedPoint?.latitude ?? ''}
                            />
                            <input
                                type="hidden"
                                name="longitude"
                                value={selectedPoint?.longitude ?? ''}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="poi_category_id">
                                    Categoría sugerida
                                </Label>
                                <Select
                                    name="poi_category_id"
                                    value={selectedCategoryId}
                                    onValueChange={setSelectedCategoryId}
                                >
                                    <SelectTrigger
                                        id="poi_category_id"
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            errors.poi_category_id,
                                        )}
                                    >
                                        <SelectValue placeholder="Opcional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.poi_category_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="suggestion_name">Nombre</Label>
                                <Input
                                    id="suggestion_name"
                                    name="name"
                                    required
                                    placeholder="Ej. Tienda comunitaria"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label>Ubicación del POI</Label>
                                <div className="overflow-hidden rounded-2xl border border-primary/10">
                                    <MapContainer
                                        center={[
                                            selectedPoint?.latitude ??
                                                route.start_latitude,
                                            selectedPoint?.longitude ??
                                                route.start_longitude,
                                        ]}
                                        zoom={14}
                                        scrollWheelZoom={false}
                                        className="h-72 w-full"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <SuggestionLocationPicker
                                            selectedPoint={selectedPoint}
                                            onSelect={setSelectedPoint}
                                        />
                                    </MapContainer>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={useCurrentLocation}
                                    >
                                        <LocateFixed data-icon="inline-start" />
                                        Usar mi ubicación
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {selectedPoint
                                            ? `${selectedPoint.latitude.toFixed(5)}, ${selectedPoint.longitude.toFixed(5)}`
                                            : 'Toca el mapa para marcar el punto'}
                                    </span>
                                </div>
                                <InputError message={errors.latitude} />
                                <InputError message={errors.longitude} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="suggestion_description">
                                    Descripción
                                </Label>
                                <textarea
                                    id="suggestion_description"
                                    name="description"
                                    className={textareaClass}
                                    placeholder={poiSuggestionPlaceholder(
                                        selectedCategoryName,
                                    )}
                                    aria-invalid={Boolean(errors.description)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="md:col-span-2">
                                <Button disabled={processing || !selectedPoint}>
                                    Enviar sugerencia
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

function SuggestionLocationPicker({
    selectedPoint,
    onSelect,
}: {
    selectedPoint: { latitude: number; longitude: number } | null;
    onSelect: (point: { latitude: number; longitude: number }) => void;
}) {
    useMapEvents({
        click(event) {
            onSelect({
                latitude: Number(event.latlng.lat.toFixed(7)),
                longitude: Number(event.latlng.lng.toFixed(7)),
            });
        },
    });

    if (!selectedPoint) {
        return null;
    }

    return (
        <CircleMarker
            center={[selectedPoint.latitude, selectedPoint.longitude]}
            pathOptions={{
                color: 'var(--primary)',
                fillColor: 'var(--primary)',
                fillOpacity: 0.9,
                opacity: 1,
            }}
            radius={8}
        />
    );
}

function poiSuggestionPlaceholder(category: string): string {
    if (category === 'comida') {
        return 'Tipo de comida, horario aproximado, plato recomendado o referencia útil';
    }

    if (category === 'taller') {
        return 'Servicio que ofrece, repuestos disponibles o teléfono de emergencia';
    }

    if (category === 'hospedaje') {
        return 'Tipo de hospedaje, precio aproximado, referencia o si recibe bicicletas';
    }

    if (category === 'salud') {
        return 'Tipo de atención, horario o referencia para llegar';
    }

    if (category === 'tienda') {
        return 'Qué vende: hidratación, snacks, repuestos u otros servicios';
    }

    if (category === 'mirador') {
        return 'Qué se observa, mejor referencia de llegada o cuidado necesario';
    }

    return 'Referencia, servicio, por qué es útil para la ruta';
}

function IncidentReportForm({
    route,
    types,
}: {
    route: CyclingRouteMapItem;
    types: CatalogOption[];
}) {
    const latitudeRef = useRef<HTMLInputElement>(null);
    const longitudeRef = useRef<HTMLInputElement>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const fillCurrentLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            if (latitudeRef.current) {
                latitudeRef.current.value = position.coords.latitude.toFixed(7);
            }

            if (longitudeRef.current) {
                longitudeRef.current.value =
                    position.coords.longitude.toFixed(7);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reportar alerta</CardTitle>
                <CardDescription>
                    Envía obstáculos, derrumbes, inseguridad u otros problemas
                    de esta ruta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form
                    {...IncidentController.store.form()}
                    options={{ preserveScroll: true }}
                    encType="multipart/form-data"
                    className="grid gap-4 md:grid-cols-2"
                >
                    {({ processing, errors }) => (
                        <>
                            <input
                                type="hidden"
                                name="route_id"
                                value={route.id}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="incident_type_id">
                                    Tipo de incidencia
                                </Label>
                                <Select name="incident_type_id" required>
                                    <SelectTrigger
                                        id="incident_type_id"
                                        className="w-full"
                                        aria-invalid={Boolean(
                                            errors.incident_type_id,
                                        )}
                                    >
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {types.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={String(type.id)}
                                                >
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.incident_type_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="incident_title">Título</Label>
                                <Input
                                    id="incident_title"
                                    name="title"
                                    required
                                    placeholder="Ej. Derrumbe pequeño"
                                    aria-invalid={Boolean(errors.title)}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="incident_description">
                                    Descripción
                                </Label>
                                <textarea
                                    id="incident_description"
                                    name="description"
                                    required
                                    className={textareaClass}
                                    placeholder="Describe el punto, riesgo y referencia para ubicarlo"
                                    aria-invalid={Boolean(errors.description)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="incident_latitude">
                                    Latitud
                                </Label>
                                <Input
                                    ref={latitudeRef}
                                    id="incident_latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    defaultValue={route.start_latitude}
                                    required
                                    aria-invalid={Boolean(errors.latitude)}
                                />
                                <InputError message={errors.latitude} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="incident_longitude">
                                    Longitud
                                </Label>
                                <Input
                                    ref={longitudeRef}
                                    id="incident_longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    defaultValue={route.start_longitude}
                                    required
                                    aria-invalid={Boolean(errors.longitude)}
                                />
                                <InputError message={errors.longitude} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="incident_photo">
                                    Foto opcional
                                </Label>
                                <ImageFileInput
                                    id="incident_photo"
                                    name="photo"
                                    invalid={Boolean(errors.photo)}
                                    onProcessingChange={setIsCompressing}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Si la foto supera 5 MB se optimiza
                                    automáticamente antes de enviarla.
                                </p>
                                <InputError message={errors.photo} />
                            </div>

                            <div className="flex flex-wrap gap-2 md:col-span-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={fillCurrentLocation}
                                >
                                    Usar mi ubicación GPS
                                </Button>
                                <Button disabled={processing || isCompressing}>
                                    Enviar incidencia
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-medium">{title}</h2>
            {items.length > 0 ? (
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                    {items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No hay datos registrados.
                </p>
            )}
        </div>
    );
}

RoutesShow.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: '/routes',
        },
        {
            title: 'Detalle',
            href: '/routes',
        },
    ],
};
