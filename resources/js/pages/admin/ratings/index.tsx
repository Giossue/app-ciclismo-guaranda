import { Form, Head, Link } from '@inertiajs/react';
import { MessageSquareText, RouteIcon, Star } from 'lucide-react';
import RatingController from '@/actions/App/Http/Controllers/Admin/RatingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CatalogOption } from '@/types';

type ManagedRating = {
    id: number;
    rating: number;
    comment: string | null;
    full_comment: string | null;
    admin_response: string | null;
    rated_at: string | null;
    route: { id: number; name: string; slug: string } | null;
    user: { id: number; name: string; email: string } | null;
    track: {
        id: number;
        is_valid: boolean;
        completion_percentage: number;
    } | null;
    status: CatalogOption | null;
};

type PaginatedRatings = {
    data: ManagedRating[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    ratings: PaginatedRatings;
    statuses: CatalogOption[];
};

const textareaClass =
    'min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export default function AdminRatingsIndex({ ratings, statuses }: Props) {
    return (
        <>
            <Head title="Valoraciones" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Valoraciones y comentarios"
                    description="Modera comentarios de ciclistas, controla su visibilidad y responde cuando sea necesario"
                />

                <div className="grid gap-4">
                    {ratings.data.map((rating) => (
                        <Card key={rating.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                <Star data-icon="inline-start" />
                                                {rating.rating}/5
                                            </Badge>
                                            {rating.status && (
                                                <Badge
                                                    variant={statusVariant(
                                                        rating.status.name,
                                                    )}
                                                >
                                                    {rating.status.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle>
                                            {rating.route?.name ?? 'Ruta'}
                                        </CardTitle>
                                        <CardDescription>
                                            {rating.comment ??
                                                'Valoración sin comentario.'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
                                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                    <div className="flex flex-wrap gap-3">
                                        <span>
                                            Enviada por{' '}
                                            {rating.user?.name ?? 'usuario'}
                                        </span>
                                        {rating.rated_at && (
                                            <span>
                                                {new Date(
                                                    rating.rated_at,
                                                ).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {rating.route && (
                                        <div className="flex items-center gap-2">
                                            <RouteIcon />
                                            <Link
                                                href={`/routes/${rating.route.slug}`}
                                                className="underline underline-offset-4"
                                                prefetch
                                            >
                                                {rating.route.name}
                                            </Link>
                                        </div>
                                    )}

                                    {rating.track && (
                                        <div>
                                            Recorrido válido:{' '}
                                            {rating.track.is_valid
                                                ? 'sí'
                                                : 'no'}{' '}
                                            ·{' '}
                                            {rating.track.completion_percentage.toLocaleString()}
                                            % completado
                                        </div>
                                    )}

                                    {rating.full_comment && (
                                        <p>{rating.full_comment}</p>
                                    )}

                                    {rating.admin_response && (
                                        <p>
                                            <strong>Respuesta admin:</strong>{' '}
                                            {rating.admin_response}
                                        </p>
                                    )}
                                </div>

                                <ModerationForm
                                    rating={rating}
                                    statuses={statuses}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {ratings.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay valoraciones</CardTitle>
                            <CardDescription>
                                Cuando un ciclista valore una ruta completada,
                                aparecerá aquí para moderación.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {ratings.from ?? 0}-{ratings.to ?? 0} de{' '}
                    {ratings.total} valoraciones.
                </div>
            </div>
        </>
    );
}

function ModerationForm({
    rating,
    statuses,
}: {
    rating: ManagedRating;
    statuses: CatalogOption[];
}) {
    return (
        <Form
            {...RatingController.update.form(rating.id)}
            options={{ preserveScroll: true }}
            className="grid gap-3 rounded-xl border bg-muted/30 p-3"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor={`moderation_status_id_${rating.id}`}>
                            Estado de moderación
                        </Label>
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
                                id={`moderation_status_id_${rating.id}`}
                                className="w-full"
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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`rating_admin_response_${rating.id}`}>
                            Respuesta administrativa
                        </Label>
                        <textarea
                            id={`rating_admin_response_${rating.id}`}
                            name="admin_response"
                            defaultValue={rating.admin_response ?? ''}
                            className={textareaClass}
                            placeholder="Agradecimiento, motivo de rechazo u observación"
                            aria-invalid={Boolean(errors.admin_response)}
                        />
                        <InputError message={errors.admin_response} />
                    </div>

                    <CardFooter className="px-0 pb-0">
                        <Button disabled={processing}>
                            <MessageSquareText data-icon="inline-start" />
                            Guardar moderación
                        </Button>
                    </CardFooter>
                </>
            )}
        </Form>
    );
}

function statusVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'aprobado') {
        return 'secondary';
    }

    if (status === 'rechazado') {
        return 'destructive';
    }

    if (status === 'oculto') {
        return 'outline';
    }

    return 'default';
}

AdminRatingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Valoraciones',
            href: '/admin/ratings',
        },
    ],
};
