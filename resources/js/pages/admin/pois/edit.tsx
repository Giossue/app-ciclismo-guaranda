import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { CatalogOption } from '@/types';
import PoiForm from './partials/poi-form';

type PoiFormData = Parameters<typeof PoiForm>[0]['poi'];

type Props = {
    poi: NonNullable<PoiFormData>;
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

export default function AdminPoisEdit({ poi, ...catalogs }: Props) {
    return (
        <>
            <Head title={`Editar ${poi.name}`} />

            <div className="flex flex-col gap-6">
                <Heading
                    title={`Editar ${poi.name}`}
                    description="Actualiza datos oficiales, detalles por categoría y relación con rutas"
                />

                <PoiForm mode="edit" poi={poi} {...catalogs} />
            </div>
        </>
    );
}

AdminPoisEdit.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: '/admin/pois',
        },
        {
            title: 'Editar POI',
            href: '/admin/pois',
        },
    ],
};
