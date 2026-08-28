import { Head, router } from '@inertiajs/react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import PoiReportController from '@/actions/App/Http/Controllers/Admin/PoiReportController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { PoiModuleNavigation } from '../partials/poi-module-navigation';

type ManagedReport = {
    description: string | null;
    id: number;
    poi: { id: number; name: string } | null;
    reported_at: string | null;
    report_type: string;
    status: string;
    user: string | null;
};

type PaginatedReports = {
    current_page: number;
    data: ManagedReport[];
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
    reports: PaginatedReports;
};

export default function AdminPoiReportsIndex({ filters, reports }: Props) {
    const changeQuery = (query: DataTableQuery) => {
        router.get(PoiReportController.url(), query, {
            only: ['reports', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedReport>[] = [
        {
            id: 'poi',
            label: 'POI',
            hideable: false,
            cell: (report) => (
                <span className="font-medium text-foreground">
                    {report.poi?.name ?? 'POI no disponible'}
                </span>
            ),
        },
        {
            id: 'report',
            label: 'Reporte',
            cellClassName: 'max-w-sm whitespace-normal',
            cell: (report) => (
                <div className="flex flex-col gap-1">
                    <span className="text-foreground">
                        {report.report_type}
                    </span>
                    <span className="line-clamp-2 text-muted-foreground">
                        {report.description || 'Sin descripción'}
                    </span>
                </div>
            ),
        },
        {
            id: 'user',
            label: 'Enviado por',
            cell: (report) => (
                <span className="text-muted-foreground">
                    {report.user || 'Usuario no disponible'}
                </span>
            ),
        },
        {
            id: 'status',
            label: 'Estado',
            cell: (report) => (
                <Badge
                    variant={
                        report.status === 'pendiente' ? 'default' : 'outline'
                    }
                >
                    {report.status}
                </Badge>
            ),
        },
        {
            id: 'date',
            label: 'Fecha',
            cell: (report) => (
                <span className="text-muted-foreground">
                    {formatDateTime(report.reported_at)}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Reportes de POIs" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Reportes de POIs"
                    description="Consulta cierres y datos incorrectos reportados por ciclistas."
                />

                <PoiModuleNavigation active="reports" />

                <DataTable
                    data={reports.data}
                    columns={columns}
                    getRowId={(report) => report.id}
                    description="Revisa los reportes recibidos y su estado actual."
                    emptyMessage="No hay reportes que coincidan con la búsqueda."
                    searchPlaceholder="Buscar por POI, tipo de reporte o ciclista"
                    query={filters}
                    onQueryChange={changeQuery}
                    pagination={{
                        currentPage: reports.current_page,
                        from: reports.from,
                        lastPage: reports.last_page,
                        perPage: reports.per_page,
                        to: reports.to,
                        total: reports.total,
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

AdminPoiReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'POIs',
            href: PoiController.index(),
        },
        {
            title: 'Reportes',
            href: PoiReportController(),
        },
    ],
};
