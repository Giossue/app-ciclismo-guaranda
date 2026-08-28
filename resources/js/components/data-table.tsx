import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Settings2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export type DataTableQuery = Record<string, number | string | undefined>;

/** Radix no admite un item con valor vacío, así que «todos» viaja con centinela. */
const ALL_FILTER_VALUE = '__all';

export type DataTableColumn<T> = {
    id: string;
    label: string;
    cell: (row: T) => React.ReactNode;
    hideable?: boolean;
    headerClassName?: string;
    cellClassName?: string;
    /**
     * Contenido alternativo para la tarjeta móvil. Sirve para bajar el ruido:
     * una taxonomía que en la tabla es badge aquí se lee mejor en texto plano.
     */
    mobileCell?: (row: T) => React.ReactNode;
    /** En móvil encabeza la tarjeta. Por defecto, la primera columna. */
    primary?: boolean;
    /** En móvil va al extremo de la cabecera. Por defecto, la columna `actions`. */
    actions?: boolean;
};

export type DataTableFilter = {
    id: string;
    label: string;
    placeholder: string;
    options: Array<{ label: string; value: string }>;
    /**
     * El selector siempre tiene un valor (p. ej. elegir sección o catálogo):
     * no cuenta como filtro activo ni se descarta al limpiar.
     */
    persistent?: boolean;
};

export type DataTablePagination = {
    currentPage: number;
    from: number | null;
    lastPage: number;
    perPage: number;
    to: number | null;
    total: number;
};

type Props<T> = {
    columns: DataTableColumn<T>[];
    data: T[];
    description?: string;
    emptyMessage: string;
    filters?: DataTableFilter[];
    getRowId: (row: T) => number | string;
    onQueryChange: (query: DataTableQuery) => void;
    pagination: DataTablePagination;
    query: DataTableQuery;
    searchPlaceholder?: string;
    title?: string;
};

/**
 * Barra de búsqueda y filtros. Vive aparte de la tabla para que un listado con
 * otra presentación —la grilla de rutas, por ejemplo— use el mismo contrato.
 */
export function DataTableToolbar({
    children,
    filters = [],
    onQueryChange,
    query,
    searchPlaceholder = 'Buscar…',
}: {
    children?: React.ReactNode;
    filters?: DataTableFilter[];
    onQueryChange: (query: DataTableQuery) => void;
    query: DataTableQuery;
    searchPlaceholder?: string;
}) {
    const hasActiveFilters = filters.some(
        (filter) => !filter.persistent && String(query[filter.id] ?? '') !== '',
    );

    const updateFilter = (id: string, value: string) => {
        onQueryChange({
            ...query,
            [id]: value === ALL_FILTER_VALUE ? undefined : value || undefined,
            page: 1,
        });
    };

    const clearQuery = () => {
        const preserved = Object.fromEntries(
            filters
                .filter((filter) => filter.persistent)
                .map((filter) => [filter.id, query[filter.id]]),
        );

        onQueryChange({ ...preserved, per_page: query.per_page });
    };

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <DataTableSearch
                    initialValue={String(query.search ?? '')}
                    placeholder={searchPlaceholder}
                    onSearchChange={(search) =>
                        onQueryChange({
                            ...query,
                            page: 1,
                            search: search || undefined,
                        })
                    }
                />

                <div className="flex flex-row flex-wrap items-center gap-3">
                    {filters.map((filter) => (
                        <Select
                            key={filter.id}
                            value={String(query[filter.id] ?? '') || undefined}
                            onValueChange={(value) =>
                                updateFilter(filter.id, value)
                            }
                        >
                            <SelectTrigger
                                size="sm"
                                aria-label={filter.label}
                                className="w-auto min-w-36"
                            >
                                <SelectValue placeholder={filter.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {!filter.persistent && (
                                        <SelectItem value={ALL_FILTER_VALUE}>
                                            {filter.placeholder}
                                        </SelectItem>
                                    )}
                                    {filter.options.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    ))}
                    {(String(query.search ?? '') !== '' ||
                        hasActiveFilters) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearQuery}
                        >
                            <X data-icon="inline-start" />
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {children && (
                <div className="hidden shrink-0 items-center gap-2 md:flex">
                    {children}
                </div>
            )}
        </div>
    );
}

export function DataTable<T>({
    columns,
    data,
    description,
    emptyMessage,
    filters = [],
    getRowId,
    onQueryChange,
    pagination,
    query,
    searchPlaceholder = 'Buscar…',
    title,
}: Props<T>) {
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const visibleColumns = useMemo(
        () => columns.filter((column) => !hiddenColumns.has(column.id)),
        [columns, hiddenColumns],
    );
    // En móvil la fila se transforma en tarjeta: sin scroll horizontal ni
    // columnas ocultas, que en una pantalla estrecha esconden datos.
    const primaryColumn =
        columns.find((column) => column.primary) ?? columns[0];
    const actionsColumn = columns.find(
        (column) => column.actions ?? column.id === 'actions',
    );
    const detailColumns = columns.filter(
        (column) => column !== primaryColumn && column !== actionsColumn,
    );

    const toggleColumn = (columnId: string, visible: boolean) => {
        setHiddenColumns((current) => {
            const next = new Set(current);

            if (visible) {
                next.delete(columnId);
            } else {
                next.add(columnId);
            }

            return next;
        });
    };

    return (
        <Card className="data-table">
            {(title || description) && (
                <CardHeader>
                    <div className="flex flex-col gap-1.5">
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && (
                            <CardDescription>{description}</CardDescription>
                        )}
                    </div>
                </CardHeader>
            )}

            <CardContent className="flex flex-col gap-4">
                <DataTableToolbar
                    filters={filters}
                    query={query}
                    onQueryChange={onQueryChange}
                    searchPlaceholder={searchPlaceholder}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                <Settings2 data-icon="inline-start" />
                                Ver
                                <ChevronDown data-icon="inline-end" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                                Columnas visibles
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                {columns
                                    .filter(
                                        (column) => column.hideable !== false,
                                    )
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={
                                                !hiddenColumns.has(column.id)
                                            }
                                            onCheckedChange={(checked) =>
                                                toggleColumn(column.id, checked)
                                            }
                                        >
                                            {column.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DataTableToolbar>

                <ul className="flex flex-col gap-3 md:hidden">
                    {data.length > 0 ? (
                        data.map((row) => (
                            <li
                                key={getRowId(row)}
                                className="flex flex-col gap-3 rounded-[var(--radius-control)] border bg-card p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {primaryColumn && (
                                        <div className="min-w-0 flex-1">
                                            {primaryColumn.cell(row)}
                                        </div>
                                    )}
                                    {actionsColumn && (
                                        <div className="shrink-0">
                                            {actionsColumn.cell(row)}
                                        </div>
                                    )}
                                </div>

                                {detailColumns.length > 0 && (
                                    <dl className="flex flex-col gap-1.5 border-t pt-3">
                                        {detailColumns.map((column) => (
                                            <div
                                                key={column.id}
                                                className="flex items-baseline justify-between gap-4"
                                            >
                                                <dt className="shrink-0 text-xs text-muted-foreground">
                                                    {column.label}
                                                </dt>
                                                <dd className="min-w-0 text-right text-sm text-foreground">
                                                    {(
                                                        column.mobileCell ??
                                                        column.cell
                                                    )(row)}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="rounded-[var(--radius-control)] border border-dashed p-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </li>
                    )}
                </ul>

                <div className="hidden overflow-hidden rounded-[var(--radius-control)] border md:block">
                    <Table className="min-w-[44rem]">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                {visibleColumns.map((column) => (
                                    <TableHead
                                        key={column.id}
                                        className={column.headerClassName}
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="[&_tr:nth-child(even)]:bg-muted/25">
                            {data.length > 0 ? (
                                data.map((row) => (
                                    <TableRow key={getRowId(row)}>
                                        {visibleColumns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                className={column.cellClassName}
                                            >
                                                {column.cell(row)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumns.length}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 border-t pt-4 lg:flex-row lg:justify-between">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                    Mostrando {pagination.from ?? 0}-{pagination.to ?? 0} de{' '}
                    {pagination.total} registros.
                </p>

                <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:flex-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Filas por página
                        </span>
                        <Select
                            value={String(pagination.perPage)}
                            onValueChange={(value) =>
                                onQueryChange({
                                    ...query,
                                    page: 1,
                                    per_page: Number(value),
                                })
                            }
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-20"
                                aria-label="Filas por página"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectGroup>
                                    {[10, 15, 25, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={String(pageSize)}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm tabular-nums">
                        Página {pagination.currentPage} de {pagination.lastPage}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="hidden sm:inline-flex"
                            disabled={pagination.currentPage === 1}
                            onClick={() => onQueryChange({ ...query, page: 1 })}
                        >
                            <ChevronsLeft />
                            <span className="sr-only">Primera página</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={pagination.currentPage === 1}
                            onClick={() =>
                                onQueryChange({
                                    ...query,
                                    page: pagination.currentPage - 1,
                                })
                            }
                        >
                            <ChevronLeft />
                            <span className="sr-only">Página anterior</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={
                                pagination.currentPage === pagination.lastPage
                            }
                            onClick={() =>
                                onQueryChange({
                                    ...query,
                                    page: pagination.currentPage + 1,
                                })
                            }
                        >
                            <ChevronRight />
                            <span className="sr-only">Página siguiente</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="hidden sm:inline-flex"
                            disabled={
                                pagination.currentPage === pagination.lastPage
                            }
                            onClick={() =>
                                onQueryChange({
                                    ...query,
                                    page: pagination.lastPage,
                                })
                            }
                        >
                            <ChevronsRight />
                            <span className="sr-only">Última página</span>
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

function DataTableSearch({
    initialValue,
    onSearchChange,
    placeholder,
}: {
    initialValue: string;
    onSearchChange: (search: string) => void;
    placeholder: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const input = inputRef.current;

        if (input && input.value !== initialValue) {
            input.value = initialValue;
        }
    }, [initialValue]);

    useEffect(() => {
        return () => window.clearTimeout(timeoutRef.current);
    }, []);

    return (
        <div className="relative w-full sm:max-w-sm">
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                ref={inputRef}
                defaultValue={initialValue}
                onChange={(event) => {
                    const search = event.target.value.trim();

                    window.clearTimeout(timeoutRef.current);

                    timeoutRef.current = window.setTimeout(() => {
                        onSearchChange(search);
                    }, 300);
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                className="pl-9"
            />
        </div>
    );
}
