import { Form, Head, Link, router } from '@inertiajs/react';
import {
    Bike,
    ChevronRight,
    Clock,
    Heart,
    MapPin,
    Phone,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import ImageGallery from '@/components/image-gallery';
import RouteMap from '@/components/routes/client-only-route-map';
import { IncidentReportSheet } from '@/components/routes/incident-report-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mediaUrl } from '@/lib/media';
import { index as mapsIndex } from '@/routes/maps';
import { show as routeShow } from '@/routes/routes';
import type { CatalogOption, MapRouteItem } from '@/types';

type MapPoi = MapRouteItem['points_of_interest'][number];

type Props = {
    routes: MapRouteItem[];
    selectedRouteSlug: string | null;
    incidentTypes: CatalogOption[];
};

export default function MapsIndex({
    routes,
    selectedRouteSlug,
    incidentTypes,
}: Props) {
    const [selectedPoi, setSelectedPoi] = useState<MapPoi | null>(null);
    const [isIncidentSheetOpen, setIsIncidentSheetOpen] = useState(false);
    const selectedRoute = routes.find(
        (route) => route.slug === selectedRouteSlug,
    );

    const selectRoute = (route: { slug: string }) => {
        setSelectedPoi(null);

        router.get(
            mapsIndex.url({ query: { route: route.slug } }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearSelection = () => {
        setSelectedPoi(null);

        router.get(
            mapsIndex.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        if (!selectedPoi) {
            return;
        }

        document.body.dataset.mapPoiSheetOpen = 'true';

        return () => {
            delete document.body.dataset.mapPoiSheetOpen;
        };
    }, [selectedPoi]);

    return (
        <>
            <Head title="Explorar" />

            <RouteMap
                routes={routes}
                mode="overview"
                immersive
                selectedSlug={selectedRouteSlug ?? undefined}
                focusSelected={Boolean(selectedRouteSlug)}
                onRouteSelect={selectRoute}
                onPoiSelect={(poi) => setSelectedPoi(poi)}
                onReportIncident={
                    selectedRoute
                        ? () => setIsIncidentSheetOpen(true)
                        : undefined
                }
                className="h-full"
            />

            {selectedPoi ? (
                <MapPoiSheet poi={selectedPoi} onClose={clearSelection} />
            ) : (
                selectedRoute && <MapRouteSheet route={selectedRoute} />
            )}
            {selectedRoute && (
                <IncidentReportSheet
                    route={selectedRoute}
                    types={incidentTypes}
                    open={isIncidentSheetOpen}
                    onOpenChange={setIsIncidentSheetOpen}
                />
            )}
        </>
    );
}

function MapPoiSheet({ poi, onClose }: { poi: MapPoi; onClose: () => void }) {
    const images = (poi.images ?? []).map((image) => ({
        src: mediaUrl(image.image_path),
        alt: image.description ?? poi.name,
        description: image.description,
    }));

    return (
        <>
            <button
                type="button"
                aria-label="Cerrar detalle del punto de interés"
                className="fixed inset-0 z-[800] bg-foreground/20"
                onClick={onClose}
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={`poi-sheet-title-${poi.id}`}
                className="fixed inset-x-0 bottom-0 z-[810] flex max-h-[min(72dvh,44rem)] flex-col rounded-t-[var(--radius-emphasis)] border-t bg-background shadow-[0_-16px_40px_color-mix(in_oklch,var(--foreground)_28%,transparent)] md:inset-x-auto md:right-6 md:bottom-6 md:w-[min(30rem,calc(100vw-3rem))] md:rounded-[var(--radius-emphasis)] md:border"
            >
                <div
                    aria-hidden="true"
                    className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/35"
                />
                <header className="flex shrink-0 items-start justify-between gap-3 px-4 pt-3 pb-4">
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                            {poi.category?.name ?? 'Punto de interés'}
                        </p>
                        <h1
                            id={`poi-sheet-title-${poi.id}`}
                            className="mt-0.5 text-xl font-semibold tracking-tight"
                        >
                            {poi.name}
                        </h1>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Cerrar punto de interés"
                    >
                        <X />
                    </Button>
                </header>

                <div className="min-h-0 overflow-y-auto px-4 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1.5rem)] md:pb-5">
                    {images.length > 0 && (
                        <ImageGallery images={images} slideClassName="h-52" />
                    )}

                    <div className="mt-4 flex flex-col gap-3 text-sm">
                        {poi.description && <p>{poi.description}</p>}
                        {poi.address && (
                            <p className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                <span>{poi.address}</span>
                            </p>
                        )}
                        {poi.phone && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="size-4 shrink-0" />
                                <span>{poi.phone}</span>
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function MapRouteSheet({ route }: { route: MapRouteItem }) {
    const favoriteAction = route.is_favorite
        ? FavoriteRouteController.destroy.form(route.slug)
        : FavoriteRouteController.store.form(route.slug);

    return (
        <section className="fixed inset-x-3 bottom-[calc(var(--safe-bottom)+1rem)] z-[600] flex flex-col gap-4 rounded-[var(--radius-emphasis)] border bg-background/95 p-4 shadow-[0_16px_48px_color-mix(in_oklch,var(--foreground)_28%,transparent)] backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:w-[min(28rem,calc(100vw-3rem))]">
            <div
                aria-hidden="true"
                className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/35 md:hidden"
            />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-start gap-1">
                        <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight">
                            {route.name}
                        </h1>
                        <Form
                            {...favoriteAction}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    disabled={processing}
                                    aria-label={
                                        route.is_favorite
                                            ? 'Quitar de favoritas'
                                            : 'Guardar en favoritas'
                                    }
                                    title={
                                        route.is_favorite
                                            ? 'Quitar de favoritas'
                                            : 'Guardar en favoritas'
                                    }
                                >
                                    <Heart
                                        fill={
                                            route.is_favorite
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                </Button>
                            )}
                        </Form>
                    </div>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">
                            {route.start_name} → {route.end_name}
                        </span>
                    </p>
                </div>
                <Button asChild variant="ghost" size="icon">
                    <Link
                        href={mapsIndex.url()}
                        replace
                        aria-label="Cerrar selección de ruta"
                    >
                        <X />
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {route.category && <Badge>{route.category.name}</Badge>}
                {route.difficulty && (
                    <Badge variant="outline">{route.difficulty.name}</Badge>
                )}
                <Metric icon={Bike}>
                    {route.metric
                        ? `${route.metric.distance_km.toLocaleString()} km`
                        : 'Sin distancia'}
                </Metric>
                <Metric icon={Clock}>
                    {route.metric
                        ? `${route.metric.estimated_time_minutes} min`
                        : 'Sin tiempo'}
                </Metric>
            </div>

            <Button asChild className="w-full">
                <Link href={routeShow.url(route.slug)} prefetch>
                    Ver ruta
                    <ChevronRight data-icon="inline-end" />
                </Link>
            </Button>
        </section>
    );
}

function Metric({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon: typeof Bike;
}) {
    return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icon className="size-4" />
            {children}
        </span>
    );
}
