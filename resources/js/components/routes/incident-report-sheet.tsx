import { Form } from '@inertiajs/react';
import { LocateFixed } from 'lucide-react';
import { useState } from 'react';
import IncidentController from '@/actions/App/Http/Controllers/Cyclist/IncidentController';
import ImageFileInput from '@/components/image-file-input';
import InputError from '@/components/input-error';
import LocationPickerMap from '@/components/routes/client-only-location-picker-map';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
            <SheetContent>
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
                                <div className="flex flex-col gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="incident_type_id">
                                            Tipo de incidencia
                                        </Label>
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
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="incident_description">
                                            Descripción
                                        </Label>
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
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>
                                            Ubicación de la incidencia
                                        </Label>
                                        <div className="overflow-hidden rounded-2xl border border-primary/10">
                                            <LocationPickerMap
                                                center={incidentPoint}
                                                selectedPoint={incidentPoint}
                                                onSelect={setIncidentPoint}
                                                className="h-64 w-full"
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={fillCurrentLocation}
                                            >
                                                <LocateFixed data-icon="inline-start" />
                                                Usar mi ubicación
                                            </Button>
                                            <span className="text-sm text-muted-foreground">{`${incidentPoint.latitude.toFixed(5)}, ${incidentPoint.longitude.toFixed(5)}`}</span>
                                        </div>
                                        <InputError message={errors.latitude} />
                                        <InputError
                                            message={errors.longitude}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="incident_photo">
                                            Foto opcional
                                        </Label>
                                        <ImageFileInput
                                            id="incident_photo"
                                            name="photo"
                                            invalid={Boolean(errors.photo)}
                                            onProcessingChange={
                                                setIsCompressing
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Si la foto supera 5 MB se optimiza
                                            automáticamente antes de enviarla.
                                        </p>
                                        <InputError message={errors.photo} />
                                    </div>
                                </div>
                            </div>
                            <SheetFooter>
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
