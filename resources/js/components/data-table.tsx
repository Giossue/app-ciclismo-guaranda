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
import { useEffect, useMemo, useState } from 'react';
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

export type DataTableColumn<T> = {
    id: string;
    label: string;
    cell: (row: T) => React.ReactNode;
    hideable?: boolean;
    headerClassName?: string;
    cellClassName?: string;
};

export type DataTableFilter = {
    id: string;
    label: string;
    placeholder: string;
    options: Array<{ label: string; value: string }>;
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
    description: string;
    emptyMessage: string;
    filters?: DataTableFilter[];
    getRowId: (row: T) => number | string;
    onQueryChange: (query: DataTableQuery) => void;
    pagination: DataTablePagination;
    query: DataTableQuery;
    searchPlaceholder?: string;
    title: string;
};

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
    const hasActiveFilters = filters.some(
        (filter) => String(query[filter.id] ?? '') !== '',
    );

    const updateFilter = (id: string, value: string) => {
        onQueryChange({
            ...query,
            [id]: value || undefined,
            page: 1,
        });
    };

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
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Settings2 data-icon="inline-start" />
                            Ver
                            <ChevronDown data-icon="inline-end" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {columns
                                .filter((column) => column.hideable !== false)
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={!hiddenColumns.has(column.id)}
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
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <DataTableSearch
                        key={String(query.search ?? '')}
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

                    <div className="flex flex-wrap gap-3">
                        {filters.map((filter) => (
                            <Select
                                key={filter.id}
                                value={
                                    String(query[filter.id] ?? '') || undefined
                                }
                                onValueChange={(value) =>
                                    updateFilter(filter.id, value)
                                }
                            >
                                <SelectTrigger
                                    size="sm"
                                    aria-label={filter.label}
                                    className="min-w-40"
                                >
                                    <SelectValue
                                        placeholder={filter.placeholder}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
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
                                onClick={() => {
                                    onQueryChange({
                                        per_page: pagination.perPage,
                                    });
                                }}
                            >
                                <X data-icon="inline-start" />
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-[var(--radius-control)] border">
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
                        <TableBody>
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

                <div className="flex w-full flex-wrap items-center justify-between gap-3 lg:w-auto lg:justify-end">
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

                    <div className="text-sm font-medium tabular-nums">
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
    const [search, setSearch] = useState(initialValue);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === initialValue) {
            return;
        }

        const timeout = window.setTimeout(() => {
            onSearchChange(normalizedSearch);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [initialValue, onSearchChange, search]);

    return (
        <div className="relative w-full lg:max-w-sm">
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="pl-9"
            />
        </div>
    );
}
