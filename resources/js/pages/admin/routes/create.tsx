import { Head } from '@inertiajs/react';
import RouteController from '@/actions/App/Http/Controllers/Admin/RouteController';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

type RoutePoiOption = Parameters<typeof RouteForm>[0]['pois'][number];

type RouteDefaults = {
    route_status_id: number | null;
    transport_mode_id: number | null;
    routing_engine_id: number | null;
};

type Props = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    poiCategories: CatalogOption[];
    pois: RoutePoiOption[];
    defaults: RouteDefaults;
    defaultGeojson?: string | null;
};

export default function AdminRoutesCreate({
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    poiCategories,
    pois,
    defaults,
    defaultGeojson,
}: Props) {
    return (
        <>
            <Head title="Nueva ruta" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Nueva ruta oficial"
                    description="Completa primero lo esencial. Los detalles complementarios se muestran solo cuando los necesites."
                />

                <RouteForm
                    mode="create"
                    statuses={statuses}
                    categories={categories}
                    difficulties={difficulties}
                    transportModes={transportModes}
                    routingEngines={routingEngines}
                    poiCategories={poiCategories}
                    pois={pois}
                    defaults={defaults}
                    defaultGeojson={defaultGeojson}
                />
            </div>
        </>
    );
}

AdminRoutesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: RouteController.index.url(),
        },
        {
            title: 'Nueva ruta',
            href: RouteController.create.url(),
        },
    ],
};
