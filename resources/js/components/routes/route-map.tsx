import 'leaflet/dist/leaflet.css';

import { Link } from '@inertiajs/react';
import L from 'leaflet';
import { Filter, Layers, LocateFixed, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    CircleMarker,
    GeoJSON,
    MapContainer,
    Marker,
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
};
const routeHaloPathOptions = {
    color: 'var(--foreground)',
    fillColor: 'var(--foreground)',
    opacity: 0.85,
    weight: 9,
};
const userPathOptions = {
    color: 'var(--card)',
    fillColor: '#2f80ed',
    fillOpacity: 0.9,
    opacity: 1,
    weight: 3,
};
const userTrackPathOptions = {
    color: 'var(--secondary)',
    opacity: 0.95,
    weight: 6,
};
const poiIconPaths: Record<string, string> = {
    Comida: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    Tienda: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    Taller: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    Salud: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    Hospedaje:
        '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>',
    Mirador:
        '<path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/><path d="M22 16H2"/><path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/>',
    default:
        '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};
const mapMarkerIconPaths = {
    start: '<path d="M5 22V4"/><path d="M5 5c3-2 6 2 10 0v8c-4 2-7-2-10 0"/>',
    finish: '<path d="M5 22V4"/><path d="M5 5h11v8H5"/><path d="M5 5h3v3H5zm6 0h3v3h-3zM8 8h3v3H8zm6 0h2v3h-2z" fill="currentColor" stroke="none"/>',
    incident:
        '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
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
        tracks: mode === 'detail' || selectedSlug !== undefined,
        endpoints: true,
        pois: true,
        incidents: true,
    }));
    const center = useMemo(() => mapCenter(routes), [routes]);
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

    const selectRoute = (route: RouteMapItem) => {
        setFilters((current) => ({
            ...current,
            tracks: true,
            endpoints: true,
        }));
        onRouteSelect?.(route);
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
                    zoomControl={false}
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
                            onRouteSelect={selectRoute}
                        />
                    ))}

                    {userLocation && (
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
                                        {Math.round(userLocation.accuracy)} m
                                    </span>
                                </div>
                            </Popup>
                        </CircleMarker>
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
                    <Marker
                        position={[route.start_latitude, route.start_longitude]}
                        icon={mapMarkerIcon('start')}
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
                    </Marker>

                    <Marker
                        position={[route.end_latitude, route.end_longitude]}
                        icon={mapMarkerIcon('finish')}
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
                    </Marker>
                </>
            )}

            {filters.pois &&
                route.points_of_interest.map((poi) => (
                    <Marker
                        key={`poi-${route.id}-${poi.id}`}
                        position={[poi.latitude, poi.longitude]}
                        icon={poiMarkerIcon(poi.category?.name)}
                        eventHandlers={{
                            click: () => onPoiSelect?.(poi as RoutePoi),
                        }}
                    />
                ))}

            {filters.incidents &&
                route.incidents.map((incident) => (
                    <Marker
                        key={`incident-${route.id}-${incident.id}`}
                        position={[incident.latitude, incident.longitude]}
                        icon={mapMarkerIcon('incident')}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 text-sm">
                                <strong>
                                    {incident.type?.name ?? 'Alerta en la ruta'}
                                </strong>
                                {'description' in incident &&
                                    incident.description && (
                                        <span>{incident.description}</span>
                                    )}
                            </div>
                        </Popup>
                    </Marker>
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

function poiMarkerIcon(categoryName?: string): L.DivIcon {
    const iconPath = poiIconPaths[categoryName ?? ''] ?? poiIconPaths.default;

    return L.divIcon({
        className: 'map-poi-marker',
        html: `<span class="map-poi-marker-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg></span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
}

function mapMarkerIcon(kind: 'start' | 'finish' | 'incident'): L.DivIcon {
    return L.divIcon({
        className: 'map-point-marker',
        html: `<span class="map-point-marker-icon map-point-marker-icon--${kind}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${mapMarkerIconPaths[kind]}</svg></span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
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
