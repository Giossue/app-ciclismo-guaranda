import { Head } from '@inertiajs/react';
import {
    MapPin,
    MessageSquareText,
    Route,
    AlertTriangle,
    UserCheck,
    Users,
} from 'lucide-react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Metric = {
    label: string;
    value: number;
    description: string;
};

type Props = {
    metrics: Record<string, Metric>;
};

const metricIcons = {
    users: Users,
    activeUsers: UserCheck,
    routes: Route,
    pois: MapPin,
    incidents: AlertTriangle,
    ratings: MessageSquareText,
} as const;

export default function AdminDashboard({ metrics }: Props) {
    const metricItems = Object.entries(metrics);

    return (
        <>
            <Head title="Resumen" />

            <div className="flex flex-col gap-6">
                <Heading
                    title="Resumen operativo"
                    description="Vista general de la actividad de Guaranda Go."
                />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metricItems.map(([key, metric]) => (
                        <Card key={key} className="min-w-0">
                            <CardHeader className="gap-3">
                                <MetricIcon metricKey={key} />
                                <CardTitle className="text-base tracking-[-0.02em] break-words">
                                    {metric.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-1">
                                <p className="text-3xl leading-none font-medium tracking-tight tabular-nums">
                                    {metric.value.toLocaleString()}
                                </p>
                                <CardDescription className="break-words">
                                    {metric.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </>
    );
}

function MetricIcon({ metricKey }: { metricKey: string }) {
    const Icon = metricIcons[metricKey as keyof typeof metricIcons] ?? Users;

    return (
        <div className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border bg-muted text-muted-foreground">
            <Icon />
        </div>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Resumen',
            href: '/admin/dashboard',
        },
    ],
};
