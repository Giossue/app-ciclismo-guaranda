import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export default function AdminDashboard({ metrics }: Props) {
    const metricItems = Object.entries(metrics);

    return (
        <>
            <Head title="Resumen" />

            <div className="flex flex-col gap-5">
                <section className="grid grid-cols-2 gap-3">
                    {metricItems.map(([key, metric]) => (
                        <Card key={key}>
                            <CardHeader className="gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardDescription>
                                        {metric.label}
                                    </CardDescription>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0"
                                    >
                                        <Activity data-icon="inline-start" />
                                        Activo
                                    </Badge>
                                </div>
                                <CardTitle className="text-3xl">
                                    {metric.value.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {metric.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>
        </>
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
