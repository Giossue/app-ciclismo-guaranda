import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

type Props = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    defaultGeojson: string;
};

export default function AdminRoutesCreate({
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    defaultGeojson,
}: Props) {
    return (
        <>
            <Head title="Nueva ruta" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Nueva ruta oficial"
                    description="Crea una ruta completa con estado, geometría GeoJSON, métricas e indicaciones operativas"
                />

                <RouteForm
                    mode="create"
                    statuses={statuses}
                    categories={categories}
                    difficulties={difficulties}
                    transportModes={transportModes}
                    routingEngines={routingEngines}
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
