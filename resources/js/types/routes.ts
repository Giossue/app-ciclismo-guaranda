import type { CatalogOption } from '@/types';

export type RouteMetric = {
    distance_km: number;
    estimated_time_minutes: number;
    positive_elevation_m?: number;
    negative_elevation_m?: number;
    transport_mode: string | null;
};

export type RoutePoiHour = {
    weekday: number;
    opens_at: string | null;
    closes_at: string | null;
    description: string | null;
};

export type RoutePoiImage = {
    id: number;
    image_path: string;
    description: string | null;
};

export type RoutePoi = {
    id: number;
    name: string;
    description: string | null;
    observations?: string | null;
    address?: string | null;
    phone?: string | null;
    latitude: number;
    longitude: number;
    category: CatalogOption | null;
    is_required: boolean;
    distance_from_start_km: number | null;
    route_observation: string | null;
    hours?: RoutePoiHour[];
    images?: RoutePoiImage[];
};

export type RouteIncidentFile = {
    id: number;
    file_path: string;
    file_type: string;
};

export type RouteIncident = {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    type: CatalogOption | null;
    status: CatalogOption | null;
    reported_at: string | null;
    files?: RouteIncidentFile[];
};

export type RouteRating = {
    id: number;
    rating: number;
    comment: string | null;
    rated_at: string | null;
    admin_response?: string | null;
    user: { id: number; name: string } | null;
    status: CatalogOption | null;
};

export type RouteRatingSummary = {
    average_rating: number | null;
    approved_count: number;
};

export type RouteUserInteraction = {
    is_favorite: boolean;
    can_rate: boolean;
    valid_tracks_count: number;
    rating: RouteRating | null;
};

export type RouteGeoJson = {
    type: 'LineString';
    coordinates: [number, number][];
};

export type CyclingRouteMapItem = {
    id: number;
    name: string;
    slug: string;
    description: string;
    start_name: string;
    start_latitude: number;
    start_longitude: number;
    end_name: string;
    end_latitude: number;
    end_longitude: number;
    road_type: string | null;
    main_image_path: string | null;
    route_version: number;
    geojson: RouteGeoJson | null;
    category: CatalogOption | null;
    difficulty: CatalogOption | null;
    metric: RouteMetric | null;
    recommendations: string[];
    observations: string[];
    points_of_interest: RoutePoi[];
    incidents: RouteIncident[];
    rating_summary: RouteRatingSummary;
    approved_ratings: RouteRating[];
    user_interaction: RouteUserInteraction;
};

export type ActiveTrack = {
    id: number;
    status: CatalogOption | null;
    started_at: string | null;
    ended_at: string | null;
    distance_traveled_km: number;
    total_time_seconds: number;
    completion_percentage: number;
    is_valid: boolean;
    summary: Record<string, unknown>;
    gps_points_count: number;
};

export type PaginatedRoutes = {
    data: CyclingRouteMapItem[];
    from: number | null;
    to: number | null;
    total: number;
};
