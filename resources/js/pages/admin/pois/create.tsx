import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import PoiForm from './partials/poi-form';

type Props = {
    categories: CatalogOption[];
    routes: CatalogOption[];
    cuisineTypes: CatalogOption[];
    priceRanges: CatalogOption[];
    lodgingTypes: CatalogOption[];
    storeTypes: CatalogOption[];
    workshopSpecialties: CatalogOption[];
    workshopServices: CatalogOption[];
    healthCenterTypes: CatalogOption[];
};

export default function AdminPoisCreate(props: Props) {
    return (
        <>
            <Head title="Nuevo POI" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Nuevo punto de interés"
                    description="Crea POIs oficiales con categoría, horarios, imágenes y relación con rutas"
                />

                <PoiForm mode="create" {...props} />
            </div>
        </>
    );
}

AdminPoisCreate.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: '/admin/pois',
        },
        {
            title: 'Nuevo POI',
            href: '/admin/pois/create',
        },
    ],
};
