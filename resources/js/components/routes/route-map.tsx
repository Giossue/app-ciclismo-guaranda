import 'leaflet/dist/leaflet.css';

import { Link } from '@inertiajs/react';
import L from 'leaflet';
import { Filter, Layers, LocateFixed, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    CircleMarker,
    GeoJSON,
    MapContainer,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import CyclistRouteController from '@/actions/App/Http/Controllers/Cyclist/RouteController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mediaUrl } from '@/lib/media';
import { getCurrentAppLocation } from '@/lib/native/capacitor';
import { cn } from '@/lib/utils';
import type {
    ActiveTrack,
    CyclingRouteMapItem,
    MapRouteItem,
    RoutePoi,
} from '@/types';

type RouteMapItem = CyclingRouteMapItem | MapRouteItem;

export type RouteMapProps = {
    routes: RouteMapItem[];
    selectedSlug?: string;
    focusSelected?: boolean;
    className?: string;
    immersive?: boolean;
    mode?: 'overview' | 'detail';
    activeTrack?: ActiveTrack | null;
    onPoiSelect?: (poi: RoutePoi) => void;
    onRouteSelect?: (route: RouteMapItem) => void;
};

type UserLocation = {
    latitude: number;
    longitude: number;
    accuracy: number;
};

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied';
type MapLayer = 'standard' | 'satellite';
type OverlayFilters = {
    tracks: boolean;
    endpoints: boolean;
    pois: boolean;
    incidents: boolean;
};

const defaultCenter: [number, number] = [-1.5926, -79.0009];
const standardLayer = {
    label: 'Mapa',
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};
const satelliteLayer = {
    label: 'Satélite',
    attribution:
        'Tiles &copy; Esri - Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};
const routePathOptions = {
    color: 'var(--warning)',
    fillColor: 'var(--warning)',
    opacity: 0.98,
    weight: 5,
    className: 'map-route-signal',
};
const routeHaloPathOptions = {
    color: 'var(--foreground)',
    fillColor: 'var(--foreground)',
    opacity: 0.85,
    weight: 9,
};
const startPathOptions = {
    color: 'var(--primary)',
    fillColor: 'var(--primary)',
    fillOpacity: 0.9,
    opacity: 1,
    className: 'map-marker-signal map-marker-signal-start',
};
const endPathOptions = {
    color: 'var(--warning)',
    fillColor: 'var(--warning)',
    fillOpacity: 0.9,
    opacity: 1,
    className: 'map-marker-signal map-marker-signal-end',
};
const poiPathOptions = {
    color: 'var(--info)',
    fillColor: 'var(--info)',
    fillOpacity: 0.9,
    opacity: 1,
    className: 'map-marker-signal map-marker-signal-poi',
};
const incidentPathOptions = {
    color: 'var(--destructive)',
    fillColor: 'var(--destructive)',
    fillOpacity: 0.9,
    opacity: 1,
    className: 'map-marker-signal map-marker-signal-incident',
};
const userPathOptions = {
    color: 'var(--card)',
    fillColor: '#2f80ed',
    fillOpacity: 0.9,
    opacity: 1,
    weight: 3,
};
const userPulsePathOptions = {
    color: '#2f80ed',
    fillColor: '#2f80ed',
    fillOpacity: 0.18,
    opacity: 0.5,
    weight: 1,
    className: 'map-user-location-sonar',
};
const userTrackPathOptions = {
    color: 'var(--secondary)',
    opacity: 0.95,
    weight: 6,
};

export default function RouteMap({
    routes,
    selectedSlug,
    focusSelected = false,
    className,
    immersive = false,
    mode = 'detail',
    activeTrack = null,
    onPoiSelect,
    onRouteSelect,
}: RouteMapProps) {
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapLayer, setMapLayer] = useState<MapLayer>('standard');
    const [filters, setFilters] = useState<OverlayFilters>(() => ({
        tracks: mode === 'detail',
        endpoints: true,
        pois: true,
        incidents: true,
    }));
    const center = useMemo(() => mapCenter(routes), [routes]);
    const navigationRoute = useMemo(
        () => selectedRoute(routes, selectedSlug),
        [routes, selectedSlug],
    );
    const activeLayer =
        mapLayer === 'satellite' ? satelliteLayer : standardLayer;
    const showOverviewFilters = mode === 'overview';

    const requestLocation = () => {
        setGpsStatus('requesting');

        void getCurrentAppLocation()
            .then((location) => {
                setUserLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracyM ?? 0,
                });
                setGpsStatus('granted');
            })
            .catch(() => setGpsStatus('denied'));
    };

    const toggleFilter = (filter: keyof OverlayFilters) => {
        setFilters((current) => ({ ...current, [filter]: !current[filter] }));
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-3',
                immersive && 'relative h-full overflow-hidden',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2',
                    immersive && 'absolute top-3 left-3 z-[500]',
                )}
            >
                {mode === 'detail' && userLocation && navigationRoute && (
                    <Button type="button" variant="overlay" size="icon" asChild>
                        <a
                            href={navigationUrl(userLocation, navigationRoute)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Abrir navegación externa"
                            title="Abrir navegación externa"
                        >
                            <Navigation />
                        </a>
                    </Button>
                )}
                <Button
                    type="button"
                    variant="overlay"
                    size="icon"
                    onClick={() =>
                        setMapLayer((current) =>
                            current === 'standard' ? 'satellite' : 'standard',
                        )
                    }
                    aria-label={`Cambiar a ${mapLayer === 'standard' ? 'satélite' : 'mapa'}`}
                    title={`Cambiar a ${mapLayer === 'standard' ? 'satélite' : 'mapa'}`}
                >
                    <Layers />
                </Button>
            </div>

            <div
                className={cn(
                    'flex flex-col gap-3',
                    immersive &&
                        'absolute top-1/2 right-3 z-[500] -translate-y-1/2',
                )}
            >
                {showOverviewFilters && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="overlay"
                                size="icon"
                                aria-label="Filtrar elementos del mapa"
                                title="Filtrar mapa"
                                className="size-14 min-h-14 rounded-full shadow-[var(--elevation-floating)]"
                            >
                                <Filter className="size-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" align="end">
                            <DropdownMenuLabel>
                                Mostrar en el mapa
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuCheckboxItem
                                    checked={filters.tracks}
                                    onCheckedChange={() =>
                                        toggleFilter('tracks')
                                    }
                                >
                                    Rutas
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.endpoints}
                                    onCheckedChange={() =>
                                        toggleFilter('endpoints')
                                    }
                                >
                                    Inicios y finales
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.pois}
                                    onCheckedChange={() => toggleFilter('pois')}
                                >
                                    Puntos de interés
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filters.incidents}
                                    onCheckedChange={() =>
                                        toggleFilter('incidents')
                                    }
                                >
                                    Incidencias
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    type="button"
                    variant="overlay"
                    size="icon"
                    onClick={requestLocation}
                    disabled={gpsStatus === 'requesting'}
                    aria-label="Mostrar mi ubicación actual"
                    title="Mi ubicación"
                    className="size-14 min-h-14 rounded-full shadow-[var(--elevation-floating)]"
                >
                    <LocateFixed className="size-6" />
                </Button>
            </div>

            {gpsStatus === 'denied' && (
                <Alert
                    className={cn(
                        immersive && 'absolute top-28 left-3 z-[500] max-w-sm',
                    )}
                >
                    <Navigation />
                    <AlertTitle>Ubicación no disponible</AlertTitle>
                    <AlertDescription>
                        Activa el permiso de ubicación para mostrar tu posición
                        sobre la ruta.
                    </AlertDescription>
                </Alert>
            )}

            <div
                className={cn(
                    'relative isolate z-0 overflow-hidden rounded-[var(--radius-map)] border border-primary/10 bg-card shadow-lg shadow-primary/10',
                    immersive &&
                        'absolute inset-0 rounded-none border-0 shadow-none',
                    className,
                )}
            >
                <MapContainer
                    center={center}
                    zoom={12}
                    scrollWheelZoom={false}
                    className={cn(
                        'relative z-0 h-[420px] w-full md:h-[520px]',
                        immersive && 'h-full md:h-full',
                    )}
                >
                    <TileLayer
                        key={mapLayer}
                        attribution={activeLayer.attribution}
                        url={activeLayer.url}
                    />

                    <FitRouteBounds
                        routes={routes}
                        filters={filters}
                        activeTrack={activeTrack}
                        selectedSlug={selectedSlug}
                        focusSelected={focusSelected}
                    />
                    <FlyToUserLocation location={userLocation} />
                    <UserTrackLine
                        activeTrack={activeTrack}
                        userLocation={userLocation}
                    />

                    {routes.map((route) => (
                        <RouteLayers
                            key={`${route.slug}-${route.route_version}`}
                            route={route}
                            selected={selectedSlug === route.slug}
                            filters={filters}
                            onPoiSelect={onPoiSelect}
                            onRouteSelect={onRouteSelect}
                        />
                    ))}

                    {userLocation && (
                        <>
                            <CircleMarker
                                center={[
                                    userLocation.latitude,
                                    userLocation.longitude,
                                ]}
                                pathOptions={userPulsePathOptions}
                                radius={28}
                                interactive={false}
                            />
                            <CircleMarker
                                center={[
                                    userLocation.latitude,
                                    userLocation.longitude,
                                ]}
                                pathOptions={userPathOptions}
                                radius={9}
                            >
                                <Popup>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <strong>Tu ubicación</strong>
                                        <span>
                                            Precisión aproximada:{' '}
                                            {Math.round(userLocation.accuracy)}{' '}
                                            m
                                        </span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

function UserTrackLine({
    activeTrack,
    userLocation,
}: {
    activeTrack: ActiveTrack | null;
    userLocation: UserLocation | null;
}) {
    const points = useMemo(() => {
        const trackPoints = activeTrack?.points ?? [];
        const line = trackPoints.map((point): [number, number] => [
            point.latitude,
            point.longitude,
        ]);

        if (userLocation) {
            const last = line.at(-1);
            const current: [number, number] = [
                userLocation.latitude,
                userLocation.longitude,
            ];

            if (!last || distanceBetweenLatLng(last, current) > 2) {
                line.push(current);
            }
        }

        return line;
    }, [activeTrack, userLocation]);

    if (points.length < 2) {
        return null;
    }

    return (
        <Polyline pathOptions={userTrackPathOptions} positions={points}>
            <Popup>
                <div className="flex flex-col gap-1 text-sm">
                    <strong>Tu recorrido</strong>
                    <span>Trayecto registrado con tu GPS.</span>
                </div>
            </Popup>
        </Polyline>
    );
}

function RouteLayers({
    route,
    selected,
    filters,
    onPoiSelect,
    onRouteSelect,
}: {
    route: RouteMapItem;
    selected: boolean;
    filters: OverlayFilters;
    onPoiSelect?: (poi: RoutePoi) => void;
    onRouteSelect?: (route: RouteMapItem) => void;
}) {
    return (
        <>
            {filters.tracks && route.geojson && (
                <>
                    <GeoJSON
                        data={route.geojson}
                        pathOptions={{
                            ...routeHaloPathOptions,
                            weight: selected ? 11 : 9,
                        }}
                    />
                    <GeoJSON
                        data={route.geojson}
                        pathOptions={{
                            ...routePathOptions,
                            weight: selected ? 7 : 5,
                        }}
                        eventHandlers={{
                            click: () => onRouteSelect?.(route),
                        }}
                    >
                        <Popup>
                            <RoutePopup route={route} />
                        </Popup>
                    </GeoJSON>
                </>
            )}

            {filters.endpoints && (
                <>
                    <CircleMarker
                        center={[route.start_latitude, route.start_longitude]}
                        pathOptions={startPathOptions}
                        radius={selected ? 8 : 7}
                        eventHandlers={{
                            click: () => onRouteSelect?.(route),
                        }}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 text-sm">
                                <strong>Inicio: {route.start_name}</strong>
                                <span>{route.name}</span>
                            </div>
                        </Popup>
                    </CircleMarker>

                    <CircleMarker
                        center={[route.end_latitude, route.end_longitude]}
                        pathOptions={endPathOptions}
                        radius={selected ? 8 : 7}
                        eventHandlers={{
                            click: () => onRouteSelect?.(route),
                        }}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 text-sm">
                                <strong>Final: {route.end_name}</strong>
                                <span>{route.name}</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                </>
            )}

            {filters.pois &&
                route.points_of_interest.map((poi) => (
                    <CircleMarker
                        key={`poi-${route.id}-${poi.id}`}
                        center={[poi.latitude, poi.longitude]}
                        pathOptions={poiPathOptions}
                        radius={6}
                        eventHandlers={{
                            click: () => onPoiSelect?.(poi as RoutePoi),
                        }}
                    >
                        <Popup>
                            <PoiPopup poi={poi} />
                        </Popup>
                    </CircleMarker>
                ))}

            {filters.incidents &&
                route.incidents.map((incident) => (
                    <CircleMarker
                        key={`incident-${route.id}-${incident.id}`}
                        center={[incident.latitude, incident.longitude]}
                        pathOptions={incidentPathOptions}
                        radius={7}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 text-sm">
                                <strong>{incident.title}</strong>
                                {incident.type && (
                                    <span>{incident.type.name}</span>
                                )}
                                {'description' in incident &&
                                    incident.description && (
                                        <span>{incident.description}</span>
                                    )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
        </>
    );
}

function RoutePopup({ route }: { route: RouteMapItem }) {
    return (
        <div className="flex max-w-56 flex-col gap-2 text-sm">
            {route.main_image_path && (
                <img
                    src={mediaUrl(route.main_image_path)}
                    alt={route.name}
                    className="h-24 w-full rounded-xl object-cover"
                />
            )}
            <strong>{route.name}</strong>
            <span>
                {route.start_name} → {route.end_name}
            </span>
            {route.metric && (
                <span>
                    {route.metric.distance_km.toLocaleString()} km ·{' '}
                    {route.metric.estimated_time_minutes} min
                </span>
            )}
            <Link
                href={CyclistRouteController.show.url(route.slug)}
                prefetch
                className="font-medium text-link underline-offset-4 hover:text-link-hover hover:underline"
            >
                Ver detalle
            </Link>
        </div>
    );
}

function PoiPopup({
    poi,
}: {
    poi: RoutePoi | MapRouteItem['points_of_interest'][number];
}) {
    const image = poi.images?.[0];

    return (
        <div className="flex max-w-56 flex-col gap-2 text-sm">
            {image && (
                <img
                    src={mediaUrl(image.image_path)}
                    alt={image.description ?? poi.name}
                    className="h-24 w-full rounded-xl object-cover"
                />
            )}
            <strong>{poi.name}</strong>
            {poi.category && <span>{poi.category.name}</span>}
            {poi.description && <span>{poi.description}</span>}
            {poi.address && <span>{poi.address}</span>}
            {poi.distance_from_start_km != null && (
                <span>Km {poi.distance_from_start_km.toLocaleString()}</span>
            )}
            {poi.route_observation && <span>{poi.route_observation}</span>}
        </div>
    );
}

function FitRouteBounds({
    routes,
    filters,
    activeTrack,
    selectedSlug,
    focusSelected,
}: {
    routes: RouteMapItem[];
    filters: OverlayFilters;
    activeTrack: ActiveTrack | null;
    selectedSlug?: string;
    focusSelected: boolean;
}) {
    const map = useMap();

    useEffect(() => {
        const points: L.LatLngExpression[] = [];

        activeTrack?.points.forEach((point) => {
            points.push([point.latitude, point.longitude]);
        });

        const routesToFit =
            focusSelected && selectedSlug
                ? routes.filter((route) => route.slug === selectedSlug)
                : routes;

        routesToFit.forEach((route) => {
            if (filters.tracks && route.geojson) {
                route.geojson.coordinates.forEach(([longitude, latitude]) => {
                    points.push([latitude, longitude]);
                });
            }

            if (filters.endpoints) {
                points.push([route.start_latitude, route.start_longitude]);
                points.push([route.end_latitude, route.end_longitude]);
            }

            if (filters.pois) {
                route.points_of_interest.forEach((poi) => {
                    points.push([poi.latitude, poi.longitude]);
                });
            }

            if (filters.incidents) {
                route.incidents.forEach((incident) => {
                    points.push([incident.latitude, incident.longitude]);
                });
            }
        });

        if (points.length === 0) {
            return;
        }

        const bounds = L.latLngBounds(points);

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
        }
    }, [activeTrack, filters, focusSelected, map, routes, selectedSlug]);

    return null;
}

function FlyToUserLocation({ location }: { location: UserLocation | null }) {
    const map = useMap();

    useEffect(() => {
        if (!location) {
            return;
        }

        map.flyTo([location.latitude, location.longitude], 17);
    }, [location, map]);

    return null;
}

function distanceBetweenLatLng(
    from: [number, number],
    to: [number, number],
): number {
    const earthRadiusMeters = 6371000;
    const latitudeDelta = degreesToRadians(to[0] - from[0]);
    const longitudeDelta = degreesToRadians(to[1] - from[1]);
    const fromLat = degreesToRadians(from[0]);
    const toLat = degreesToRadians(to[0]);

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(longitudeDelta / 2) ** 2;

    return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
}

function mapCenter(routes: RouteMapItem[]): [number, number] {
    const firstRoute = routes[0];

    if (!firstRoute) {
        return defaultCenter;
    }

    return [firstRoute.start_latitude, firstRoute.start_longitude];
}

function selectedRoute(
    routes: RouteMapItem[],
    selectedSlug?: string,
): RouteMapItem | null {
    if (selectedSlug) {
        return routes.find((route) => route.slug === selectedSlug) ?? null;
    }

    return routes[0] ?? null;
}

function navigationUrl(location: UserLocation, route: RouteMapItem): string {
    const origin = `${location.latitude},${location.longitude}`;
    const destination = `${route.start_latitude},${route.start_longitude}`;

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=bicycling`;
}
