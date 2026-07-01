import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

type RoutePoiOption = Parameters<typeof RouteForm>[0]['pois'][number];

type Props = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    poiCategories: CatalogOption[];
    pois: RoutePoiOption[];
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
    defaultGeojson,
}: Props) {
    return (
        <>
            <Head title="Nueva ruta" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Nueva ruta oficial"
                    description="Dibuja el recorrido, carga portada y conecta POIs turísticos desde una sola pantalla"
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
            href: '/admin/routes',
        },
        {
            title: 'Nueva ruta',
            href: '/admin/routes/create',
        },
    ],
};
