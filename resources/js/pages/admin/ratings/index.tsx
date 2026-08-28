import { Form, Head, Link, router } from '@inertiajs/react';
import {
    EllipsisVertical,
    MessageSquareText,
    RouteIcon,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import RatingController from '@/actions/App/Http/Controllers/Admin/RatingController';
import { DataTable } from '@/components/data-table';
import type { DataTableColumn, DataTableQuery } from '@/components/data-table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { show as routeShow } from '@/routes/routes';
import type { CatalogOption } from '@/types';

type ManagedRating = {
    admin_response: string | null;
    comment: string | null;
    full_comment: string | null;
    id: number;
    rated_at: string | null;
    rating: number;
    route: { id: number; name: string; slug: string } | null;
    status: CatalogOption | null;
    track: {
        id: number;
        is_valid: boolean;
        completion_percentage: number;
    } | null;
    user: { id: number; name: string; email: string } | null;
};

type PaginatedRatings = {
    current_page: number;
    data: ManagedRating[];
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

type RatingFilters = {
    per_page: number;
    rating: string;
    search: string;
    status: string;
};

type Props = {
    filters: RatingFilters;
    ratings: PaginatedRatings;
    statuses: CatalogOption[];
};

export default function AdminRatingsIndex({
    filters,
    ratings,
    statuses,
}: Props) {
    const changeQuery = (query: DataTableQuery) => {
        router.get(RatingController.index.url(), query, {
            only: ['ratings', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const columns: DataTableColumn<ManagedRating>[] = [
        {
            id: 'comment',
            label: 'Comentario',
            hideable: false,
            cellClassName: 'max-w-sm whitespace-normal',
            cell: (rating) => (
                <span className="line-clamp-2 text-muted-foreground">
                    {rating.comment ?? 'Valoración sin comentario.'}
                </span>
            ),
        },
        {
            id: 'ratedAt',
            label: 'Fecha',
            cell: (rating) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatDate(rating.rated_at)}
                </span>
            ),
        },
        {
            id: 'user',
            label: 'Usuario',
            cell: (rating) => (
                <div className="flex min-w-48 flex-col gap-0.5">
                    <span className="text-foreground">
                        {rating.user?.name ?? 'Usuario eliminado'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {rating.user?.email ?? 'Sin correo disponible'}
                    </span>
                </div>
            ),
        },
        {
            id: 'route',
            label: 'Ruta',
            cell: (rating) =>
                rating.route ? (
                    <Link
                        href={routeShow.url(rating.route.slug)}
                        className="text-foreground underline-offset-4 hover:underline focus-visible:underline"
                        prefetch
                    >
                        {rating.route.name}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">
                        Ruta eliminada
                    </span>
                ),
        },
        {
            id: 'score',
            label: 'Puntuación',
            mobileCell: (rating) => `${rating.rating}/5`,
            cell: (rating) => (
                <Badge variant="outline">
                    <Star data-icon="inline-start" />
                    {rating.rating}/5
                </Badge>
            ),
        },
        {
            id: 'status',
            label: 'Moderación',
            cell: (rating) =>
                rating.status ? (
                    <Badge variant={statusVariant(rating.status.name)}>
                        {rating.status.name}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">Sin estado</span>
                ),
        },
        {
            id: 'track',
            label: 'Recorrido',
            cell: (rating) =>
                rating.track ? (
                    <span className="text-muted-foreground">
                        {rating.track.is_valid ? 'Válido' : 'No válido'} ·{' '}
                        {rating.track.completion_percentage.toLocaleString()}%
                    </span>
                ) : (
                    <span className="text-muted-foreground">Sin recorrido</span>
                ),
        },
        {
            id: 'actions',
            label: 'Acciones',
            hideable: false,
            headerClassName: 'w-14 text-right',
            cellClassName: 'text-right',
            cell: (rating) => (
                <RatingRowActions rating={rating} statuses={statuses} />
            ),
        },
    ];

    return (
        <>
            <Head title="Valoraciones" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Valoraciones y comentarios"
                    description="Revisa comentarios, controla su visibilidad y responde cuando sea necesario."
                />

                <DataTable
                    data={ratings.data}
                    columns={columns}
                    getRowId={(rating) => rating.id}
                    emptyMessage="No hay valoraciones que coincidan con los filtros seleccionados."
                    searchPlaceholder="Buscar comentario, usuario o ruta"
                    query={filters}
                    onQueryChange={changeQuery}
                    filters={[
                        {
                            id: 'status',
                            label: 'Filtrar por estado',
                            placeholder: 'Todos los estados',
                            options: statuses.map((status) => ({
                                label: status.name,
                                value: String(status.id),
                            })),
                        },
                        {
                            id: 'rating',
                            label: 'Filtrar por puntuación',
                            placeholder: 'Todas las puntuaciones',
                            options: [1, 2, 3, 4, 5].map((rating) => ({
                                label: `${rating} estrella${rating === 1 ? '' : 's'}`,
                                value: String(rating),
                            })),
                        },
                    ]}
                    pagination={{
                        currentPage: ratings.current_page,
                        from: ratings.from,
                        lastPage: ratings.last_page,
                        perPage: ratings.per_page,
                        to: ratings.to,
                        total: ratings.total,
                    }}
                />
            </div>
        </>
    );
}

function RatingRowActions({
    rating,
    statuses,
}: {
    rating: ManagedRating;
    statuses: CatalogOption[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Acciones para la valoración de ${rating.user?.name ?? 'usuario'}`}
                    >
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setOpen(true)}>
                            <MessageSquareText />
                            Revisar y moderar
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Revisar valoración</SheetTitle>
                        <SheetDescription>
                            {rating.user?.name ?? 'Usuario eliminado'} ·{' '}
                            {rating.route?.name ?? 'Ruta eliminada'} ·{' '}
                            {rating.rating}/5
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border p-3 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                            <RouteIcon />
                            Comentario del ciclista
                        </div>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                            {rating.full_comment ??
                                'Esta valoración no incluye comentario.'}
                        </p>
                    </div>

                    <ModerationForm
                        rating={rating}
                        statuses={statuses}
                        onCancel={() => setOpen(false)}
                        onSuccess={() => setOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

function ModerationForm({
    onCancel,
    onSuccess,
    rating,
    statuses,
}: {
    onCancel: () => void;
    onSuccess: () => void;
    rating: ManagedRating;
    statuses: CatalogOption[];
}) {
    return (
        <Form
            {...RatingController.update.form(rating.id)}
            onSuccess={onSuccess}
            options={{ preserveScroll: true }}
            className="flex flex-col gap-5 px-5 pb-5"
        >
            {({ processing, errors }) => (
                <>
                    <FieldGroup>
                        <Field
                            data-invalid={Boolean(errors.moderation_status_id)}
                        >
                            <FieldLabel
                                htmlFor={`moderation-status-${rating.id}`}
                            >
                                Estado de moderación
                            </FieldLabel>
                            <Select
                                name="moderation_status_id"
                                defaultValue={
                                    rating.status
                                        ? String(rating.status.id)
                                        : undefined
                                }
                                required
                            >
                                <SelectTrigger
                                    id={`moderation-status-${rating.id}`}
                                    aria-invalid={Boolean(
                                        errors.moderation_status_id,
                                    )}
                                >
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {statuses.map((status) => (
                                            <SelectItem
                                                key={status.id}
                                                value={String(status.id)}
                                            >
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.moderation_status_id} />
                        </Field>

                        <Field data-invalid={Boolean(errors.admin_response)}>
                            <FieldLabel
                                htmlFor={`rating-response-${rating.id}`}
                            >
                                Respuesta administrativa
                            </FieldLabel>
                            <Textarea
                                id={`rating-response-${rating.id}`}
                                name="admin_response"
                                defaultValue={rating.admin_response ?? ''}
                                placeholder="Agradecimiento, motivo de rechazo u observación"
                                aria-invalid={Boolean(errors.admin_response)}
                            />
                            <InputError message={errors.admin_response} />
                        </Field>
                    </FieldGroup>

                    <SheetFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <MessageSquareText data-icon="inline-start" />
                            Guardar moderación
                        </Button>
                    </SheetFooter>
                </>
            )}
        </Form>
    );
}

function statusVariant(status: string): 'default' | 'outline' {
    return status === 'pendiente' ? 'default' : 'outline';
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
    }).format(new Date(value));
}

AdminRatingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Valoraciones',
            href: '/admin/ratings',
        },
    ],
};
