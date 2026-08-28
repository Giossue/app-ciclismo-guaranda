import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CatalogPaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    to: number | null;
    total: number;
};

type Props = {
    buildPageUrl: (page: number) => string;
    itemLabel: string;
    pagination: CatalogPaginationMeta;
};

export function CatalogPagination({
    buildPageUrl,
    itemLabel,
    pagination,
}: Props) {
    const hasPreviousPage = pagination.current_page > 1;
    const hasNextPage = pagination.current_page < pagination.last_page;

    return (
        <footer className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite">
                Mostrando {pagination.from ?? 0}-{pagination.to ?? 0} de{' '}
                {pagination.total} {itemLabel}.
            </p>

            {pagination.last_page > 1 && (
                <nav
                    aria-label={`Paginación de ${itemLabel}`}
                    className="flex items-center gap-3 sm:ml-auto"
                >
                    <span className="tabular-nums">
                        Página {pagination.current_page} de{' '}
                        {pagination.last_page}
                    </span>
                    <div className="flex items-center gap-1">
                        <PageButton
                            href={buildPageUrl(1)}
                            disabled={!hasPreviousPage}
                            label="Primera página"
                            className="hidden sm:inline-flex"
                        >
                            <ChevronsLeft />
                        </PageButton>
                        <PageButton
                            href={buildPageUrl(pagination.current_page - 1)}
                            disabled={!hasPreviousPage}
                            label="Página anterior"
                        >
                            <ChevronLeft />
                        </PageButton>
                        <PageButton
                            href={buildPageUrl(pagination.current_page + 1)}
                            disabled={!hasNextPage}
                            label="Página siguiente"
                        >
                            <ChevronRight />
                        </PageButton>
                        <PageButton
                            href={buildPageUrl(pagination.last_page)}
                            disabled={!hasNextPage}
                            label="Última página"
                            className="hidden sm:inline-flex"
                        >
                            <ChevronsRight />
                        </PageButton>
                    </div>
                </nav>
            )}
        </footer>
    );
}

function PageButton({
    children,
    className,
    disabled,
    href,
    label,
}: {
    children: React.ReactNode;
    className?: string;
    disabled: boolean;
    href: string;
    label: string;
}) {
    if (disabled) {
        return (
            <Button
                type="button"
                variant="outline"
                size="icon"
                className={className}
                disabled
            >
                {children}
                <span className="sr-only">{label}</span>
            </Button>
        );
    }

    return (
        <Button
            asChild
            type="button"
            variant="outline"
            size="icon"
            className={className}
        >
            <Link href={href} preserveScroll aria-label={label}>
                {children}
            </Link>
        </Button>
    );
}
