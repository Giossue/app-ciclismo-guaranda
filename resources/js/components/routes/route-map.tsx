import 'leaflet/dist/leaflet.css';

import { Link } from '@inertiajs/react';
import type { FeatureCollection, LineString } from 'geojson';
import L from 'leaflet';
import {
    LocateFixed,
    Navigation,
    RadioTower,
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
import { cn } from '@/lib/utils';
import type { CyclingRouteMapItem, RoutePoi } from '@/types';

type Props = {
    routes: CyclingRouteMapItem[];
    selectedSlug?: string;
    className?: string;
};

type UserLocation = {
    latitude: number;
    longitude: number;
    accuracy: number;
};

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

const defaultCenter: [number, number] = [-1.5926, -79.0009];
const routePathOptions = {
    color: 'var(--primary)',
    fillColor: 'var(--primary)',
    opacity: 0.9,
    weight: 5,
};
const secondaryPathOptions = {
    color: 'var(--chart-2)',
    fillColor: 'var(--chart-2)',
    fillOpacity: 0.85,
    opacity: 1,
};
const incidentPathOptions = {
    color: 'var(--destructive)',
    fillColor: 'var(--destructive)',
    fillOpacity: 0.85,
    opacity: 1,
};
const userPathOptions = {
    color: 'var(--chart-1)',
    fillColor: 'var(--chart-1)',
    fillOpacity: 0.85,
    opacity: 1,
};
const connectorPathOptions = {
    color: 'var(--chart-1)',
    opacity: 0.8,
    weight: 4,
    dashArray: '8 8',
};

export default function RouteMap({ routes, selectedSlug, className }: Props) {
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const center = useMemo(() => mapCenter(routes), [routes]);
    const navigationRoute = useMemo(
        () => selectedRoute(routes, selectedSlug),
        [routes, selectedSlug],
    );

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
        if (!navigator.geolocation) {
            setGpsStatus('unsupported');

            return;
        }

        setGpsStatus('requesting');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setGpsStatus('granted');
            },
            () => setGpsStatus('denied'),
            {
                enableHighAccuracy: true,
                maximumAge: 30_000,
                timeout: 12_000,
            },
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
                {userLocation && navigationRoute && (
                    <Button type="button" variant="outline" size="sm" asChild>
                        <a
                            href={navigationUrl(userLocation, navigationRoute)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Navigation data-icon="inline-start" />
                            Ir al inicio
                        </a>
                    </Button>
                )}
            </div>

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
                    'relative isolate z-0 overflow-hidden rounded-2xl border bg-card shadow-sm',
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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitRouteBounds routes={routes} />
                    <FlyToUserLocation location={userLocation} />

                    {routes.map((route) => (
                        <RouteLayers
                            key={`${route.slug}-${route.route_version}`}
                            route={route}
                            selected={selectedSlug === route.slug}
                        />
                    ))}

                    {userLocation && navigationRoute && (
                        <Polyline
                            positions={[
                                [userLocation.latitude, userLocation.longitude],
                                [
                                    navigationRoute.start_latitude,
                                    navigationRoute.start_longitude,
                                ],
                            ]}
                            pathOptions={connectorPathOptions}
                        >
                            <Popup>
                                <div className="flex flex-col gap-2 text-sm">
                                    <strong>Conexión hacia el inicio</strong>
                                    <span>
                                        Línea referencial desde tu ubicación al
                                        punto inicial. Para navegación real abre
                                        el mapa externo.
                                    </span>
                                    <a
                                        href={navigationUrl(
                                            userLocation,
                                            navigationRoute,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        Abrir navegación
                                    </a>
                                </div>
                            </Popup>
                        </Polyline>
                    )}

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

function RouteLayers({
    route,
    selected,
}: {
    route: CyclingRouteMapItem;
    selected: boolean;
}) {
    return (
        <>
            {route.geojson && (
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
            )}

            <CircleMarker
                center={[route.start_latitude, route.start_longitude]}
                pathOptions={secondaryPathOptions}
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
                pathOptions={routePathOptions}
                radius={selected ? 8 : 7}
            >
                <Popup>
                    <div className="flex flex-col gap-1 text-sm">
                        <strong>Final: {route.end_name}</strong>
                        <span>{route.name}</span>
                    </div>
                </Popup>
            </CircleMarker>

            {route.points_of_interest.map((poi) => (
                <CircleMarker
                    key={`poi-${route.id}-${poi.id}`}
                    center={[poi.latitude, poi.longitude]}
                    pathOptions={secondaryPathOptions}
                    radius={6}
                >
                    <Popup>
                        <PoiPopup poi={poi} />
                    </Popup>
                </CircleMarker>
            ))}

            {route.incidents.map((incident) => (
                <CircleMarker
                    key={`incident-${route.id}-${incident.id}`}
                    center={[incident.latitude, incident.longitude]}
                    pathOptions={incidentPathOptions}
                    radius={7}
                >
                    <Popup>
                        <div className="flex flex-col gap-1 text-sm">
                            <strong>{incident.title}</strong>
                            {incident.type && <span>{incident.type.name}</span>}
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
                    className="h-24 w-full rounded-lg object-cover"
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
                    className="h-24 w-full rounded-lg object-cover"
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

function FitRouteBounds({ routes }: { routes: CyclingRouteMapItem[] }) {
    const map = useMap();

    useEffect(() => {
        const features: FeatureCollection<LineString> = {
            type: 'FeatureCollection',
            features: routes
                .filter((route) => route.geojson !== null)
                .map((route) => ({
                    type: 'Feature',
                    properties: { name: route.name },
                    geometry: route.geojson as LineString,
                })),
        };

        if (features.features.length === 0) {
            return;
        }

        const bounds = L.geoJSON(features).getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
        }
    }, [map, routes]);

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
