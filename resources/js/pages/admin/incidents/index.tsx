import { Form, Head, Link } from '@inertiajs/react';
import { AlertTriangle, FileImage, MapPin, RouteIcon } from 'lucide-react';
import IncidentController from '@/actions/App/Http/Controllers/Admin/IncidentController';
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

type ManagedIncident = {
    id: number;
    title: string;
    description: string;
    full_description: string;
    latitude: number;
    longitude: number;
    reported_at: string | null;
    resolved_at: string | null;
    admin_response: string | null;
    route: { id: number; name: string; slug: string } | null;
    type: CatalogOption | null;
    status: CatalogOption | null;
    user: { id: number; name: string; email: string } | null;
    files: {
        id: number;
        file_path: string;
        file_type: string;
        size_bytes: number | null;
    }[];
};

type PaginatedIncidents = {
    data: ManagedIncident[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    incidents: PaginatedIncidents;
    statuses: CatalogOption[];
    types: CatalogOption[];
};

const textareaClass =
    'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export default function AdminIncidentsIndex({
    incidents,
    statuses,
    types,
}: Props) {
    return (
        <>
            <Head title="Incidencias" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Incidencias"
                    description="Revisa reportes de ciclistas y valida cuáles se muestran como activas en las rutas"
                />

                <div className="flex flex-wrap gap-2">
                    {types.map((type) => (
                        <Badge key={type.id} variant="outline">
                            {type.name}
                        </Badge>
                    ))}
                </div>

                <div className="grid gap-4">
                    {incidents.data.map((incident) => (
                        <Card key={incident.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {incident.status && (
                                                <Badge
                                                    variant={statusVariant(
                                                        incident.status.name,
                                                    )}
                                                >
                                                    {incident.status.name}
                                                </Badge>
                                            )}
                                            {incident.type && (
                                                <Badge variant="outline">
                                                    <AlertTriangle data-icon="inline-start" />
                                                    {incident.type.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle>{incident.title}</CardTitle>
                                        <CardDescription>
                                            {incident.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
                                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                    <div className="flex flex-wrap gap-3">
                                        <span>
                                            Reportado por{' '}
                                            {incident.user?.name ?? 'usuario'}
                                        </span>
                                        {incident.reported_at && (
                                            <span>
                                                {new Date(
                                                    incident.reported_at,
                                                ).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <MapPin />
                                            <span>
                                                {incident.latitude.toFixed(5)},{' '}
                                                {incident.longitude.toFixed(5)}
                                            </span>
                                        </div>
                                        {incident.route && (
                                            <div className="flex items-center gap-2">
                                                <RouteIcon />
                                                <Link
                                                    href={`/routes/${incident.route.slug}`}
                                                    className="underline underline-offset-4"
                                                    prefetch
                                                >
                                                    {incident.route.name}
                                                </Link>
                                            </div>
                                        )}
                                        {incident.files.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <FileImage />
                                                <span>
                                                    {incident.files.length}{' '}
                                                    imagen
                                                    {incident.files.length === 1
                                                        ? ''
                                                        : 'es'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p>{incident.full_description}</p>
                                    {incident.admin_response && (
                                        <p>
                                            <strong>Respuesta admin:</strong>{' '}
                                            {incident.admin_response}
                                        </p>
                                    )}
                                </div>

                                <ReviewForm
                                    incident={incident}
                                    statuses={statuses}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {incidents.data.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>No hay incidencias reportadas</CardTitle>
                            <CardDescription>
                                Cuando un ciclista reporte una incidencia
                                aparecerá aquí para revisión.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground">
                    Mostrando {incidents.from ?? 0}–{incidents.to ?? 0} de{' '}
                    {incidents.total} incidencias.
                </div>
            </div>
        </>
    );
}

function ReviewForm({
    incident,
    statuses,
}: {
    incident: ManagedIncident;
    statuses: CatalogOption[];
}) {
    return (
        <Form
            {...IncidentController.update.form(incident.id)}
            options={{ preserveScroll: true }}
            className="grid gap-3 rounded-xl border bg-muted/30 p-3"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor={`incident_status_id_${incident.id}`}>
                            Estado de revisión
                        </Label>
                        <Select
                            name="incident_status_id"
                            defaultValue={
                                incident.status
                                    ? String(incident.status.id)
                                    : undefined
                            }
                            required
                        >
                            <SelectTrigger
                                id={`incident_status_id_${incident.id}`}
                                className="w-full"
                                aria-invalid={Boolean(
                                    errors.incident_status_id,
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
                        <InputError message={errors.incident_status_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`admin_response_${incident.id}`}>
                            Respuesta administrativa
                        </Label>
                        <textarea
                            id={`admin_response_${incident.id}`}
                            name="admin_response"
                            defaultValue={incident.admin_response ?? ''}
                            className={textareaClass}
                            placeholder="Acción tomada, recomendación o motivo de descarte"
                            aria-invalid={Boolean(errors.admin_response)}
                        />
                        <InputError message={errors.admin_response} />
                    </div>

                    <CardFooter className="px-0 pb-0">
                        <Button disabled={processing}>Guardar revisión</Button>
                    </CardFooter>
                </>
            )}
        </Form>
    );
}

function statusVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'en revisión') {
        return 'destructive';
    }

    if (status === 'resuelta') {
        return 'secondary';
    }

    if (status === 'descartada') {
        return 'outline';
    }

    return 'default';
}

AdminIncidentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Incidencias',
            href: '/admin/incidents',
        },
    ],
};
