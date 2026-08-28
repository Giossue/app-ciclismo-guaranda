import 'leaflet/dist/leaflet.css';

import { useEffect } from 'react';
import {
    CircleMarker,
    MapContainer,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';

export type LocationPoint = {
    latitude: number;
    longitude: number;
};

export type LocationPickerMapProps = {
    center: LocationPoint;
    selectedPoint: LocationPoint | null;
    onSelect: (point: LocationPoint) => void;
    className: string;
};

export default function LocationPickerMap({
    center,
    selectedPoint,
    onSelect,
    className,
}: LocationPickerMapProps) {
    return (
        <MapContainer
            center={[center.latitude, center.longitude]}
            zoom={14}
            scrollWheelZoom={false}
            className={className}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker selectedPoint={selectedPoint} onSelect={onSelect} />
        </MapContainer>
    );
}

function LocationPicker({
    selectedPoint,
    onSelect,
}: Pick<LocationPickerMapProps, 'selectedPoint' | 'onSelect'>) {
    const map = useMap();

    useEffect(() => {
        if (selectedPoint === null) {
            return;
        }

        map.setView(
            [selectedPoint.latitude, selectedPoint.longitude],
            map.getZoom(),
            { animate: false },
        );
    }, [map, selectedPoint]);

    useMapEvents({
        click(event) {
            onSelect({
                latitude: Number(event.latlng.lat.toFixed(7)),
                longitude: Number(event.latlng.lng.toFixed(7)),
            });
        },
    });

    if (selectedPoint === null) {
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
