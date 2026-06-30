import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import RouteForm from './partials/route-form';

type RouteFormData = Parameters<typeof RouteForm>[0]['route'];

type Props = {
    statuses: CatalogOption[];
    categories: CatalogOption[];
    difficulties: CatalogOption[];
    transportModes: CatalogOption[];
    routingEngines: CatalogOption[];
    route: NonNullable<RouteFormData>;
};

export default function AdminRoutesEdit({
    statuses,
    categories,
    difficulties,
    transportModes,
    routingEngines,
    route,
}: Props) {
    return (
        <>
            <Head title={`Editar ${route.name}`} />

            <div className="flex flex-col gap-6">
                <Heading
                    title={`Editar ${route.name}`}
                    description="Actualiza datos relevantes; el sistema incrementa la versión cuando detecta cambios"
                />

                <RouteForm
                    mode="edit"
                    route={route}
                    statuses={statuses}
                    categories={categories}
                    difficulties={difficulties}
                    transportModes={transportModes}
                    routingEngines={routingEngines}
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
