import { Form } from '@inertiajs/react';
import { LocateFixed } from 'lucide-react';
import { useState } from 'react';
import IncidentController from '@/actions/App/Http/Controllers/Cyclist/IncidentController';
import ImageFileInput from '@/components/image-file-input';
import InputError from '@/components/input-error';
import LocationPickerMap from '@/components/routes/client-only-location-picker-map';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
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
import type { CatalogOption, CyclingRouteMapItem } from '@/types';

type IncidentReportRoute = Pick<
    CyclingRouteMapItem,
    'id' | 'start_latitude' | 'start_longitude'
>;

export function IncidentReportSheet({
    route,
    types,
    open,
    onOpenChange,
}: {
    route: IncidentReportRoute;
    types: CatalogOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [incidentPoint, setIncidentPoint] = useState({
        latitude: route.start_latitude,
        longitude: route.start_longitude,
    });
    const [isCompressing, setIsCompressing] = useState(false);

    const fillCurrentLocation = () => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            setIncidentPoint({
                latitude: Number(position.coords.latitude.toFixed(7)),
                longitude: Number(position.coords.longitude.toFixed(7)),
            });
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="z-[1001] w-full sm:max-w-lg"
                overlayClassName="z-[1000]"
            >
                <Form
                    {...IncidentController.store.form()}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    encType="multipart/form-data"
                    className="flex min-h-0 flex-1 flex-col"
                >
                    {({ processing, errors }) => (
                        <>
                            <SheetHeader>
                                <SheetTitle>Reportar alerta</SheetTitle>
                                <SheetDescription>
                                    Indica el tipo, describe el riesgo y marca
                                    el punto exacto de la ruta.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                                <input
                                    type="hidden"
                                    name="route_id"
                                    value={route.id}
                                />
                                <input
                                    type="hidden"
                                    name="latitude"
                                    value={incidentPoint.latitude}
                                />
                                <input
                                    type="hidden"
                                    name="longitude"
                                    value={incidentPoint.longitude}
                                />
                                <FieldGroup>
                                    <Field
                                        data-invalid={Boolean(
                                            errors.incident_type_id,
                                        )}
                                    >
                                        <FieldLabel htmlFor="incident_type_id">
                                            Tipo de incidencia
                                        </FieldLabel>
                                        <Select
                                            name="incident_type_id"
                                            required
                                        >
                                            <SelectTrigger
                                                id="incident_type_id"
                                                className="w-full"
                                                aria-invalid={Boolean(
                                                    errors.incident_type_id,
                                                )}
                                            >
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {types.map((type) => (
                                                        <SelectItem
                                                            key={type.id}
                                                            value={String(
                                                                type.id,
                                                            )}
                                                        >
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.incident_type_id}
                                        />
                                    </Field>
                                    <Field
                                        data-invalid={Boolean(
                                            errors.description,
                                        )}
                                    >
                                        <FieldLabel htmlFor="incident_description">
                                            Descripción
                                        </FieldLabel>
                                        <Textarea
                                            id="incident_description"
                                            name="description"
                                            required
                                            placeholder="Describe el punto, riesgo y referencia para ubicarlo"
                                            aria-invalid={Boolean(
                                                errors.description,
                                            )}
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </Field>
                                    <Field
                                        data-invalid={Boolean(
                                            errors.latitude || errors.longitude,
                                        )}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <FieldLabel>
                                                    Ubicación de la incidencia
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Usa tu posición o toca el
                                                    mapa para marcar el punto.
                                                </FieldDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={fillCurrentLocation}
                                            >
                                                <LocateFixed data-icon="inline-start" />
                                                Mi ubicación
                                            </Button>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-primary/10">
                                            <LocationPickerMap
                                                center={incidentPoint}
                                                selectedPoint={incidentPoint}
                                                onSelect={setIncidentPoint}
                                                className="h-64 w-full"
                                            />
                                        </div>
                                        <FieldDescription>{`Punto seleccionado: ${incidentPoint.latitude.toFixed(5)}, ${incidentPoint.longitude.toFixed(5)}`}</FieldDescription>
                                        <InputError message={errors.latitude} />
                                        <InputError
                                            message={errors.longitude}
                                        />
                                    </Field>
                                    <Field data-invalid={Boolean(errors.photo)}>
                                        <FieldLabel htmlFor="incident_photo">
                                            Foto opcional
                                        </FieldLabel>
                                        <ImageFileInput
                                            id="incident_photo"
                                            name="photo"
                                            invalid={Boolean(errors.photo)}
                                            onProcessingChange={
                                                setIsCompressing
                                            }
                                        />
                                        <FieldDescription>
                                            Si la foto supera 5 MB se optimiza
                                            automáticamente antes de enviarla.
                                        </FieldDescription>
                                        <InputError message={errors.photo} />
                                    </Field>
                                </FieldGroup>
                            </div>
                            <SheetFooter className="pb-[calc(var(--safe-bottom)+1rem)] sm:pb-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button disabled={processing || isCompressing}>
                                    Enviar alerta
                                </Button>
                            </SheetFooter>
                        </>
                    )}
                </Form>
            </SheetContent>
        </Sheet>
    );
}
