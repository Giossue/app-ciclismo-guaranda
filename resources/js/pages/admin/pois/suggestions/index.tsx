import { Head, router } from '@inertiajs/react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import PoiSuggestionController from '@/actions/App/Http/Controllers/Admin/PoiSuggestionController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import type { CatalogOption } from '@/types';

type ManagedSuggestion = {
    category: CatalogOption | null;
    description: string | null;
    id: number;
    name: string;
    status: string;
    suggested_at: string | null;
    user: string | null;
};

type PaginatedSuggestions = {
    current_page: number;
    data: ManagedSuggestion[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type FeedbackFilters = {
    per_page: number;
    search: string;
};

type Props = {
    filters: FeedbackFilters;
    suggestions: PaginatedSuggestions;
};

export default function AdminPoiSuggestionsIndex({
    filters,
    suggestions,
}: Props) {
    const changeQuery = (query: DataTableQuery) => {
        router.get(PoiSuggestionController.url(), query, {
            only: ['suggestions', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedSuggestion>[] = [
        {
            id: 'suggestion',
            label: 'Sugerencia',
            hideable: false,
            cellClassName: 'max-w-sm whitespace-normal',
            cell: (suggestion) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                        {suggestion.name}
                    </span>
                    <span className="line-clamp-2 text-muted-foreground">
                        {suggestion.description || 'Sin descripción'}
                    </span>
                </div>
            ),
        },
        {
            id: 'category',
            label: 'Categoría',
            mobileCell: (suggestion) =>
                suggestion.category?.name ?? 'Sin categoría',
            cell: (suggestion) =>
                suggestion.category ? (
                    <Badge variant="outline">{suggestion.category.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">Sin categoría</span>
                ),
        },
        {
            id: 'user',
            label: 'Enviada por',
            cell: (suggestion) => (
                <span className="text-muted-foreground">
                    {suggestion.user || 'Usuario no disponible'}
                </span>
            ),
        },
        {
            id: 'status',
            label: 'Estado',
            cell: (suggestion) => (
                <Badge
                    variant={
                        suggestion.status === 'pendiente'
                            ? 'default'
                            : 'outline'
                    }
                >
                    {suggestion.status}
                </Badge>
            ),
        },
        {
            id: 'date',
            label: 'Fecha',
            cell: (suggestion) => (
                <span className="text-muted-foreground">
                    {formatDateTime(suggestion.suggested_at)}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Sugerencias de POIs" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Sugerencias de POIs"
                    description="Consulta los puntos de interés enviados por ciclistas."
                />

                <DataTable
                    data={suggestions.data}
                    columns={columns}
                    getRowId={(suggestion) => suggestion.id}
                    description="Revisa las sugerencias recibidas y su estado actual."
                    emptyMessage="No hay sugerencias que coincidan con la búsqueda."
                    searchPlaceholder="Buscar por POI, categoría o ciclista"
                    query={filters}
                    onQueryChange={changeQuery}
                    pagination={{
                        currentPage: suggestions.current_page,
                        from: suggestions.from,
                        lastPage: suggestions.last_page,
                        perPage: suggestions.per_page,
                        to: suggestions.to,
                        total: suggestions.total,
                    }}
                />
            </div>
        </>
    );
}

function formatDateTime(value: string | null): string {
    if (value === null) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

AdminPoiSuggestionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: PoiController.index(),
        },
        {
            title: 'Sugerencias',
            href: PoiSuggestionController(),
        },
    ],
};
