import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-draw';
import 'leaflet-control-geocoder';

import type { LineString } from 'geojson';
import L from 'leaflet';
import { Layers, LocateFixed, MapPinned, RouteIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    CircleMarker,
    MapContainer,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type RoutePoiDraft = {
    key: string;
    name: string;
    latitude: string;
    longitude: string;
};

type Props = {
    initialGeojson?: string | null;
    startLatitude?: string | number | null;
    startLongitude?: string | number | null;
    endLatitude?: string | number | null;
    endLongitude?: string | number | null;
    errors: Partial<Record<string, string>>;
    onDistanceChange: (distanceKm: string) => void;
    onGeojsonChange?: (geojson: string) => void;
    poiDrafts?: RoutePoiDraft[];
    activePoiKey?: string | null;
    onPoiLocationChange?: (
        key: string,
        latitude: string,
        longitude: string,
    ) => void;
};

type GeometryState = {
    geojson: string;
    startLatitude: string;
    startLongitude: string;
    endLatitude: string;
    endLongitude: string;
    distanceKm: string;
    pointsCount: number;
};

type GeocoderControl = L.Control & L.Evented;

type GeocoderFactory = {
    geocoder: (options: Record<string, unknown>) => GeocoderControl;
};

type DrawCreatedEvent = L.LeafletEvent & {
    layer: L.Layer;
    layerType: string;
};

const defaultCenter: [number, number] = [-1.5926, -79.0009];
type MapLayer = 'standard' | 'satellite';
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
const emptyGeometry: GeometryState = {
    geojson: '',
    startLatitude: '',
    startLongitude: '',
    endLatitude: '',
    endLongitude: '',
    distanceKm: '',
    pointsCount: 0,
};

export default function RouteGeometryEditor({
    initialGeojson,
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
    errors,
    onDistanceChange,
    onGeojsonChange,
    poiDrafts = [],
    activePoiKey = null,
    onPoiLocationChange,
}: Props) {
    const initialLine = useMemo(
        () => parseLineString(initialGeojson),
        [initialGeojson],
    );
    const fallbackLine = useMemo(
        () =>
            lineFromCoordinates(
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude,
            ),
        [startLatitude, startLongitude, endLatitude, endLongitude],
    );
    const initialLatLngs = initialLine ?? fallbackLine;
    const [geometry, setGeometry] = useState<GeometryState>(() =>
        initialLatLngs ? geometryFromLatLngs(initialLatLngs) : emptyGeometry,
    );
    const [mapLayer, setMapLayer] = useState<MapLayer>('standard');
    const [locationRequest, setLocationRequest] = useState(0);
    const activeLayer =
        mapLayer === 'satellite' ? satelliteLayer : standardLayer;
    const activePoi = poiDrafts.find((poi) => poi.key === activePoiKey);

    useEffect(() => {
        if (geometry.distanceKm !== '') {
            onDistanceChange(geometry.distanceKm);
        }
    }, [geometry.distanceKm, onDistanceChange]);

    useEffect(() => {
        onGeojsonChange?.(geometry.geojson);
    }, [geometry.geojson, onGeojsonChange]);

    const center = initialLatLngs?.[0] ?? defaultCenter;

    return (
        <div className="grid gap-3 sm:col-span-2">
            <div className="flex flex-col gap-2">
                <Label>Recorrido en mapa</Label>
                <Alert>
                    <RouteIcon />
                    <AlertTitle>Dibuja el trayecto real</AlertTitle>
                    <AlertDescription>
                        Dibuja la línea de la ruta. Para puntos de interés,
                        pulsa “Marcar en mapa” en el punto y toca su ubicación.
                    </AlertDescription>
                </Alert>
                {activePoi && (
                    <Alert>
                        <MapPinned />
                        <AlertTitle>Marcando punto de interés</AlertTitle>
                        <AlertDescription>
                            Toca el mapa para ubicar “
                            {activePoi.name || 'Punto nuevo'}”.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLocationRequest((value) => value + 1)}
                >
                    <LocateFixed data-icon="inline-start" />
                    Usar mi ubicación
                </Button>
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

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom
                    className="h-[440px] w-full"
                >
                    <TileLayer
                        key={mapLayer}
                        attribution={activeLayer.attribution}
                        url={activeLayer.url}
                    />
                    <DrawToolbar
                        initialLatLngs={initialLatLngs}
                        onChange={setGeometry}
                    />
                    <PoiPlacementLayer
                        poiDrafts={poiDrafts}
                        activePoiKey={activePoiKey}
                        onPoiLocationChange={onPoiLocationChange}
                    />
                    <AdminLocationMarker requestToken={locationRequest} />
                </MapContainer>
            </div>

            <input type="hidden" name="geojson" value={geometry.geojson} />
            <input
                type="hidden"
                name="start_latitude"
                value={geometry.startLatitude}
            />
            <input
                type="hidden"
                name="start_longitude"
                value={geometry.startLongitude}
            />
            <input
                type="hidden"
                name="end_latitude"
                value={geometry.endLatitude}
            />
            <input
                type="hidden"
                name="end_longitude"
                value={geometry.endLongitude}
            />

            <div className="grid gap-2 sm:grid-cols-3">
                <GeometryMetric
                    label="Distancia trazada"
                    value={
                        geometry.distanceKm
                            ? `${Number(geometry.distanceKm).toLocaleString()} km`
                            : 'Sin trazo'
                    }
                />
                <GeometryMetric
                    label="Inicio"
                    value={formatCoordinate(
                        geometry.startLatitude,
                        geometry.startLongitude,
                    )}
                />
                <GeometryMetric
                    label="Final"
                    value={formatCoordinate(
                        geometry.endLatitude,
                        geometry.endLongitude,
                    )}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={geometry.pointsCount > 2 ? 'secondary' : 'outline'}
                >
                    <MapPinned data-icon="inline-start" />
                    {geometry.pointsCount > 2
                        ? `${geometry.pointsCount} puntos del recorrido`
                        : geometry.pointsCount === 2
                          ? 'Solo inicio/final: agrega puntos de la vía'
                          : 'Dibuja mínimo 2 puntos'}
                </Badge>
                <Badge variant="outline">
                    <LocateFixed data-icon="inline-start" />
                    Buscador OSM/Nominatim
                </Badge>
            </div>

            <div className="grid gap-1">
                <InputError message={errors.geojson} />
                <InputError message={errors['geojson.type']} />
                <InputError message={errors['geojson.coordinates']} />
                <InputError message={errors.start_latitude} />
                <InputError message={errors.start_longitude} />
                <InputError message={errors.end_latitude} />
                <InputError message={errors.end_longitude} />
            </div>
        </div>
    );
}

function PoiPlacementLayer({
    poiDrafts,
    activePoiKey,
    onPoiLocationChange,
}: {
    poiDrafts: RoutePoiDraft[];
    activePoiKey: string | null;
    onPoiLocationChange?: (
        key: string,
        latitude: string,
        longitude: string,
    ) => void;
}) {
    useMapEvents({
        click(event) {
            if (!activePoiKey || !onPoiLocationChange) {
                return;
            }

            onPoiLocationChange(
                activePoiKey,
                String(roundCoordinate(event.latlng.lat)),
                String(roundCoordinate(event.latlng.lng)),
            );
        },
    });

    return (
        <>
            {poiDrafts.map((poi) => {
                const latitude = Number(poi.latitude);
                const longitude = Number(poi.longitude);

                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    return null;
                }

                return (
                    <CircleMarker
                        key={poi.key}
                        center={[latitude, longitude]}
                        pathOptions={{
                            color:
                                poi.key === activePoiKey
                                    ? 'var(--warning)'
                                    : 'var(--info)',
                            fillColor:
                                poi.key === activePoiKey
                                    ? 'var(--warning)'
                                    : 'var(--info)',
                            fillOpacity: 0.95,
                            opacity: 1,
                        }}
                        radius={8}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 text-sm">
                                <strong>{poi.name || 'Punto nuevo'}</strong>
                                <span>Punto de interés de la ruta</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}

function DrawToolbar({
    initialLatLngs,
    onChange,
}: {
    initialLatLngs?: [number, number][];
    onChange: (geometry: GeometryState) => void;
}) {
    const map = useMap();

    useEffect(() => {
        const editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

        if (initialLatLngs && initialLatLngs.length >= 2) {
            const existingLine = L.polyline(initialLatLngs, {
                color: 'var(--warning)',
                weight: 6,
            });
            editableLayers.addLayer(existingLine);
            map.fitBounds(existingLine.getBounds(), {
                padding: [24, 24],
                maxZoom: 15,
            });
        }

        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: 'var(--warning)',
                        weight: 6,
                    },
                },
                polygon: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
            },
            edit: {
                featureGroup: editableLayers,
                remove: true,
            },
        });
        map.addControl(drawControl);

        const geocoderFactory = L.Control as unknown as GeocoderFactory;
        const geocoder = geocoderFactory
            .geocoder({
                defaultMarkGeocode: false,
                placeholder: 'Buscar lugar...',
                errorMessage: 'No se encontró el lugar.',
            })
            .addTo(map);

        geocoder.on('markgeocode', (event: L.LeafletEvent) => {
            const result = event as L.LeafletEvent & {
                geocode?: { bbox?: L.LatLngBounds; center?: L.LatLng };
            };

            if (result.geocode?.bbox) {
                map.fitBounds(result.geocode.bbox, { maxZoom: 16 });

                return;
            }

            if (result.geocode?.center) {
                map.setView(result.geocode.center, 16);
            }
        });

        const updateFromLayers = () => {
            const line = firstPolyline(editableLayers);
            onChange(line ? geometryFromPolyline(line) : emptyGeometry);
        };

        const handleCreated = (event: L.LeafletEvent) => {
            const createdEvent = event as DrawCreatedEvent;

            if (createdEvent.layerType !== 'polyline') {
                return;
            }

            editableLayers.clearLayers();
            editableLayers.addLayer(createdEvent.layer);
            updateFromLayers();
        };

        const handleChanged = () => updateFromLayers();

        map.on(L.Draw.Event.CREATED, handleCreated);
        map.on(L.Draw.Event.EDITED, handleChanged);
        map.on(L.Draw.Event.DELETED, handleChanged);

        updateFromLayers();

        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
            map.off(L.Draw.Event.EDITED, handleChanged);
            map.off(L.Draw.Event.DELETED, handleChanged);
            geocoder.remove();
            map.removeControl(drawControl);
            map.removeLayer(editableLayers);
        };
    }, [initialLatLngs, map, onChange]);

    return null;
}

function AdminLocationMarker({ requestToken }: { requestToken: number }) {
    const map = useMap();
    const [location, setLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (requestToken === 0 || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const point: [number, number] = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];
                setLocation(point);
                map.flyTo(point, 16);
            },
            () => undefined,
            { enableHighAccuracy: true, maximumAge: 30_000, timeout: 12_000 },
        );
    }, [map, requestToken]);

    if (!location) {
        return null;
    }

    return (
        <CircleMarker
            center={location}
            pathOptions={{
                color: 'var(--secondary)',
                fillColor: 'var(--secondary)',
                fillOpacity: 0.9,
                opacity: 1,
            }}
            radius={8}
        />
    );
}

function firstPolyline(layers: L.FeatureGroup): L.Polyline | null {
    let line: L.Polyline | null = null;

    layers.eachLayer((layer) => {
        if (line === null && layer instanceof L.Polyline) {
            line = layer;
        }
    });

    return line;
}

function geometryFromPolyline(polyline: L.Polyline): GeometryState {
    const latLngs = flattenLatLngs(polyline.getLatLngs());

    return geometryFromLatLngs(latLngs.map((point) => [point.lat, point.lng]));
}

function geometryFromLatLngs(latLngs: [number, number][]): GeometryState {
    if (latLngs.length < 2) {
        return emptyGeometry;
    }

    const coordinates = latLngs.map(([latitude, longitude]) => [
        roundCoordinate(longitude),
        roundCoordinate(latitude),
    ]);
    const first = latLngs[0];
    const last = latLngs[latLngs.length - 1];
    const geojson = JSON.stringify(
        {
            type: 'LineString',
            coordinates,
        },
        null,
        2,
    );

    return {
        geojson,
        startLatitude: String(roundCoordinate(first[0])),
        startLongitude: String(roundCoordinate(first[1])),
        endLatitude: String(roundCoordinate(last[0])),
        endLongitude: String(roundCoordinate(last[1])),
        distanceKm: routeDistanceKm(latLngs),
        pointsCount: latLngs.length,
    };
}

function parseLineString(
    value?: string | null,
): [number, number][] | undefined {
    if (!value) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(value) as Partial<LineString>;

        if (
            parsed.type !== 'LineString' ||
            !Array.isArray(parsed.coordinates)
        ) {
            return undefined;
        }

        const points = parsed.coordinates
            .filter(
                (coordinate): coordinate is [number, number] =>
                    Array.isArray(coordinate) &&
                    coordinate.length >= 2 &&
                    Number.isFinite(Number(coordinate[0])) &&
                    Number.isFinite(Number(coordinate[1])),
            )
            .map(
                ([longitude, latitude]) =>
                    [Number(latitude), Number(longitude)] satisfies [
                        number,
                        number,
                    ],
            );

        return points.length >= 2 ? points : undefined;
    } catch {
        return undefined;
    }
}

function lineFromCoordinates(
    startLatitude?: string | number | null,
    startLongitude?: string | number | null,
    endLatitude?: string | number | null,
    endLongitude?: string | number | null,
): [number, number][] | undefined {
    const startLat = Number(startLatitude);
    const startLng = Number(startLongitude);
    const endLat = Number(endLatitude);
    const endLng = Number(endLongitude);

    if (
        [startLat, startLng, endLat, endLng].every((value) =>
            Number.isFinite(value),
        )
    ) {
        return [
            [startLat, startLng],
            [endLat, endLng],
        ];
    }

    return undefined;
}

function flattenLatLngs(latLngs: unknown): L.LatLng[] {
    if (!Array.isArray(latLngs)) {
        return [];
    }

    return latLngs.flatMap((point) => {
        if (Array.isArray(point) && Array.isArray(point[0])) {
            return flattenLatLngs(point);
        }

        return [L.latLng(point as L.LatLngExpression)];
    });
}

function routeDistanceKm(latLngs: [number, number][]): string {
    const meters = latLngs.reduce((total, point, index) => {
        if (index === 0) {
            return total;
        }

        const previous = latLngs[index - 1];

        return (
            total +
            L.latLng(previous[0], previous[1]).distanceTo(
                L.latLng(point[0], point[1]),
            )
        );
    }, 0);

    return (meters / 1000).toFixed(3);
}

function roundCoordinate(value: number): number {
    return Number(value.toFixed(7));
}

function formatCoordinate(latitude: string, longitude: string): string {
    if (latitude === '' || longitude === '') {
        return 'Sin punto';
    }

    return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
}

function GeometryMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p
                className={cn(
                    'mt-1 text-sm font-semibold',
                    value === 'Sin punto' || value === 'Sin trazo'
                        ? 'text-muted-foreground'
                        : 'text-foreground',
                )}
            >
                {value}
            </p>
        </div>
    );
}
