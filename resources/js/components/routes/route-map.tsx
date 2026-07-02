import 'leaflet/dist/leaflet.css';

import { Link } from '@inertiajs/react';
import L from 'leaflet';
import {
    Layers,
    LocateFixed,
    MapPin,
    Navigation,
    RadioTower,
    RouteIcon,
    ShieldAlert,
    Store,
    Wifi,
    WifiOff,
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mediaUrl } from '@/lib/media';
import { getCurrentAppLocation } from '@/lib/native/capacitor';
import { cn } from '@/lib/utils';
import type { ActiveTrack, CyclingRouteMapItem, RoutePoi } from '@/types';

type Props = {
    routes: CyclingRouteMapItem[];
    selectedSlug?: string;
    className?: string;
    mode?: 'overview' | 'detail';
    activeTrack?: ActiveTrack | null;
};

type UserLocation = {
    latitude: number;
    longitude: number;
    accuracy: number;
};

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';
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
const startPathOptions = {
    color: 'var(--primary)',
    fillColor: 'var(--primary)',
    fillOpacity: 0.9,
    opacity: 1,
};
const endPathOptions = {
    color: 'var(--warning)',
    fillColor: 'var(--warning)',
    fillOpacity: 0.9,
    opacity: 1,
};
const poiPathOptions = {
    color: 'var(--info)',
    fillColor: 'var(--info)',
    fillOpacity: 0.9,
    opacity: 1,
};
const incidentPathOptions = {
    color: 'var(--destructive)',
    fillColor: 'var(--destructive)',
    fillOpacity: 0.9,
    opacity: 1,
};
const userPathOptions = {
    color: 'var(--secondary)',
    fillColor: 'var(--secondary)',
    fillOpacity: 0.9,
    opacity: 1,
};
const userTrackPathOptions = {
    color: 'var(--secondary)',
    opacity: 0.95,
    weight: 6,
};

export default function RouteMap({
    routes,
    selectedSlug,
    className,
    mode = 'detail',
    activeTrack = null,
}: Props) {
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
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

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-primary/10 bg-card/80 p-2 shadow-sm shadow-primary/10 backdrop-blur">
                <Badge variant={isOnline ? 'secondary' : 'destructive'}>
                    {isOnline ? (
                        <Wifi data-icon="inline-start" />
                    ) : (
                        <WifiOff data-icon="inline-start" />
                    )}
                    {isOnline ? 'Con conexión' : 'Sin conexión'}
                </Badge>
                <Badge
                    variant={gpsStatus === 'granted' ? 'secondary' : 'outline'}
                >
                    <RadioTower data-icon="inline-start" />
                    {gpsLabel(gpsStatus)}
                </Badge>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    disabled={gpsStatus === 'requesting'}
                >
                    <LocateFixed data-icon="inline-start" />
                    Ubicación actual
                </Button>
                {mode === 'detail' && userLocation && navigationRoute && (
                    <Button type="button" variant="outline" size="sm" asChild>
                        <a
                            href={navigationUrl(userLocation, navigationRoute)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Navigation data-icon="inline-start" />
                            Abrir navegación externa
                        </a>
                    </Button>
                )}
                <Button
                    type="button"
                    variant={mapLayer === 'satellite' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() =>
                        setMapLayer((current) =>
                            current === 'standard' ? 'satellite' : 'standard',
                        )
                    }
                >
                    <Layers data-icon="inline-start" />
                    {activeLayer.label}
                </Button>
            </div>

            {showOverviewFilters && (
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        active={filters.endpoints}
                        onClick={() => toggleFilter('endpoints')}
                        label="Inicios/finales"
                        icon={MapPin}
                    />
                    <FilterButton
                        active={filters.pois}
                        onClick={() => toggleFilter('pois')}
                        label="POIs"
                        icon={Store}
                    />
                    <FilterButton
                        active={filters.incidents}
                        onClick={() => toggleFilter('incidents')}
                        label="Incidencias"
                        icon={ShieldAlert}
                    />
                    <FilterButton
                        active={filters.tracks}
                        onClick={() => toggleFilter('tracks')}
                        label="Trazados"
                        icon={RouteIcon}
                    />
                </div>
            )}

            {(gpsStatus === 'denied' || gpsStatus === 'unsupported') && (
                <Alert>
                    <Navigation />
                    <AlertTitle>Ubicación no disponible</AlertTitle>
                    <AlertDescription>
                        {gpsStatus === 'unsupported'
                            ? 'Este navegador o WebView no soporta geolocalización.'
                            : 'Activa el permiso de ubicación para mostrar tu posición sobre la ruta.'}
                    </AlertDescription>
                </Alert>
            )}

            <div
                className={cn(
                    'relative isolate z-0 overflow-hidden rounded-[2rem] border border-primary/10 bg-card shadow-lg shadow-primary/10',
                    className,
                )}
            >
                <MapContainer
                    center={center}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="relative z-0 h-[420px] w-full md:h-[520px]"
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

function FilterButton({
    active,
    onClick,
    label,
    icon: Icon,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: typeof RouteIcon;
}) {
    return (
        <Button
            type="button"
            size="sm"
            variant={active ? 'secondary' : 'outline'}
            onClick={onClick}
        >
            <Icon data-icon="inline-start" />
            {label}
        </Button>
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
}: {
    route: CyclingRouteMapItem;
    selected: boolean;
    filters: OverlayFilters;
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
                                <span>{incident.description}</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
        </>
    );
}

function RoutePopup({ route }: { route: CyclingRouteMapItem }) {
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
                href={`/routes/${route.slug}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
            >
                Ver detalle
            </Link>
        </div>
    );
}

function PoiPopup({ poi }: { poi: RoutePoi }) {
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
            {poi.distance_from_start_km !== null && (
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
}: {
    routes: CyclingRouteMapItem[];
    filters: OverlayFilters;
    activeTrack: ActiveTrack | null;
}) {
    const map = useMap();

    useEffect(() => {
        const points: L.LatLngExpression[] = [];

        activeTrack?.points.forEach((point) => {
            points.push([point.latitude, point.longitude]);
        });

        routes.forEach((route) => {
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
    }, [activeTrack, filters, map, routes]);

    return null;
}

function FlyToUserLocation({ location }: { location: UserLocation | null }) {
    const map = useMap();

    useEffect(() => {
        if (!location) {
            return;
        }

        map.flyTo([location.latitude, location.longitude], 15);
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

function mapCenter(routes: CyclingRouteMapItem[]): [number, number] {
    const firstRoute = routes[0];

    if (!firstRoute) {
        return defaultCenter;
    }

    return [firstRoute.start_latitude, firstRoute.start_longitude];
}

function selectedRoute(
    routes: CyclingRouteMapItem[],
    selectedSlug?: string,
): CyclingRouteMapItem | null {
    if (selectedSlug) {
        return routes.find((route) => route.slug === selectedSlug) ?? null;
    }

    return routes[0] ?? null;
}

function navigationUrl(
    location: UserLocation,
    route: CyclingRouteMapItem,
): string {
    const origin = `${location.latitude},${location.longitude}`;
    const destination = `${route.start_latitude},${route.start_longitude}`;

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=bicycling`;
}

function gpsLabel(status: GpsStatus): string {
    if (status === 'requesting') {
        return 'Solicitando GPS';
    }

    if (status === 'granted') {
        return 'GPS activo';
    }

    if (status === 'denied') {
        return 'GPS sin permiso';
    }

    if (status === 'unsupported') {
        return 'GPS no soportado';
    }

    return 'GPS pendiente';
}
