import { Form, Head, Link, router } from '@inertiajs/react';
import { Bike, ChevronRight, Clock, Heart, MapPin, X } from 'lucide-react';
import FavoriteRouteController from '@/actions/App/Http/Controllers/Cyclist/FavoriteRouteController';
import RouteMap from '@/components/routes/client-only-route-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { index as mapsIndex } from '@/routes/maps';
import { show as routeShow } from '@/routes/routes';
import type { MapRouteItem } from '@/types';

type Props = {
    routes: MapRouteItem[];
    selectedRouteSlug: string | null;
};

export default function MapsIndex({ routes, selectedRouteSlug }: Props) {
    const selectedRoute = routes.find(
        (route) => route.slug === selectedRouteSlug,
    );

    const selectRoute = (route: { slug: string }) => {
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
                className="h-full"
            />

            {selectedRoute && <MapRouteSheet route={selectedRoute} />}
        </>
    );
}

function MapRouteSheet({ route }: { route: MapRouteItem }) {
    const favoriteAction = route.is_favorite
        ? FavoriteRouteController.destroy.form(route.slug)
        : FavoriteRouteController.store.form(route.slug);

    return (
        <section className="fixed inset-x-3 bottom-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1.75rem)] z-[600] flex flex-col gap-4 rounded-[var(--radius-emphasis)] border bg-background/95 p-4 shadow-[0_16px_48px_color-mix(in_oklch,var(--foreground)_28%,transparent)] backdrop-blur md:inset-x-auto md:right-6 md:bottom-6 md:w-[min(28rem,calc(100vw-3rem))]">
            <div
                aria-hidden="true"
                className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/35 md:hidden"
            />
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {route.name}
                    </h1>
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

            <div className="grid grid-cols-2 gap-2">
                <Form {...favoriteAction} options={{ preserveScroll: true }}>
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                            disabled={processing}
                        >
                            <Heart data-icon="inline-start" />
                            {route.is_favorite ? 'Guardada' : 'Guardar'}
                        </Button>
                    )}
                </Form>
                <Button asChild className="w-full">
                    <Link href={routeShow.url(route.slug)} prefetch>
                        Ver ruta
                        <ChevronRight data-icon="inline-end" />
                    </Link>
                </Button>
            </div>
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
