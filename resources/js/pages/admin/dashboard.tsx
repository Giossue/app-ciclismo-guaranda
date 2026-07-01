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
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {metricItems.map(([key, metric]) => (
                        <Card key={key} className="min-w-0">
                            <CardHeader className="gap-2">
                                <Badge variant="outline" className="w-fit">
                                    <Activity data-icon="inline-start" />
                                    Activo
                                </Badge>
                                <CardDescription className="break-words">
                                    {metric.label}
                                </CardDescription>
                                <CardTitle className="text-3xl">
                                    {metric.value.toLocaleString()}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm break-words text-muted-foreground">
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
