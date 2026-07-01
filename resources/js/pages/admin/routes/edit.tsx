import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

type RouteFormData = Parameters<typeof RouteForm>[0]['route'];
type RoutePoiOption = Parameters<typeof RouteForm>[0]['pois'][number];

type Props = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    poiCategories: CatalogOption[];
    pois: RoutePoiOption[];
    route: NonNullable<RouteFormData>;
};

export default function AdminRoutesEdit({
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    poiCategories,
    pois,
    route,
}: Props) {
    return (
        <>
            <Head title={`Editar ${route.name}`} />

            <div className="flex flex-col gap-6">
                <Heading
                    title={`Editar ${route.name}`}
                    description="Ajusta trazado, portada, métricas y POIs; los cambios relevantes incrementan la versión"
                />

                <RouteForm
                    mode="edit"
                    route={route}
                    statuses={statuses}
                    categories={categories}
                    difficulties={difficulties}
                    transportModes={transportModes}
                    routingEngines={routingEngines}
                    poiCategories={poiCategories}
                    pois={pois}
                />
            </div>
        </>
    );
}

AdminRoutesEdit.layout = {
    breadcrumbs: [
        {
            title: 'Rutas',
            href: '/admin/routes',
        },
        {
            title: 'Editar ruta',
            href: '/admin/routes',
        },
    ],
};
