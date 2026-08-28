import { Head, usePage } from '@inertiajs/react';
import { Bike, Clock3, Route } from 'lucide-react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    progress: {
        completed_tracks: number;
        distance_km: number;
        total_time_seconds: number;
    };
};

export default function UserDashboard() {
    const { auth, progress } = usePage<PageProps>().props;
    const name = auth.user?.name ?? 'ciclista';
    const distance = new Intl.NumberFormat('es-EC', {
        maximumFractionDigits: 1,
    }).format(progress.distance_km);

    return (
        <>
            <Head title="Inicio" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Heading
                    title={`¡Bienvenido, ${name}!`}
                    description="Qué bueno tenerte de vuelta. Cada recorrido suma a tu historia."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Tu progreso</CardTitle>
                        <CardDescription>
                            Resumen de tus recorridos finalizados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-3 divide-x divide-border">
                            <div className="flex min-w-0 flex-col items-center gap-2 px-2 text-center">
                                <dt className="flex items-center gap-1 text-[var(--fs-caption)] text-muted-foreground">
                                    <Route aria-hidden="true" />
                                    Recorridos
                                </dt>
                                <dd className="font-bold text-[var(--fs-lg)] text-foreground">
                                    {progress.completed_tracks}
                                </dd>
                            </div>
                            <div className="flex min-w-0 flex-col items-center gap-2 px-2 text-center">
                                <dt className="flex items-center gap-1 text-[var(--fs-caption)] text-muted-foreground">
                                    <Bike aria-hidden="true" />
                                    Distancia
                                </dt>
                                <dd className="font-bold text-[var(--fs-lg)] text-foreground">
                                    {distance} km
                                </dd>
                            </div>
                            <div className="flex min-w-0 flex-col items-center gap-2 px-2 text-center">
                                <dt className="flex items-center gap-1 text-[var(--fs-caption)] text-muted-foreground">
                                    <Clock3 aria-hidden="true" />
                                    Tiempo
                                </dt>
                                <dd className="font-bold text-[var(--fs-lg)] text-foreground">
                                    {formatDuration(
                                        progress.total_time_seconds,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function formatDuration(totalSeconds: number): string {
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${totalMinutes} min`;
    }

    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
