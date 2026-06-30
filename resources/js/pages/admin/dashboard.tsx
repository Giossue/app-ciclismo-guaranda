import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { adminQuickActions } from '@/lib/admin-navigation';

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
            <Head title="Panel administrador" />

            <div className="flex flex-col gap-5">
                <Alert>
                    <ShieldCheck />
                    <AlertTitle>
                        Panel protegido por rol administrador
                    </AlertTitle>
                    <AlertDescription>
                        Esta base centraliza la operación de Guaranda Go. Los
                        módulos se irán activando por fases sin exponer acciones
                        incompletas a ciclistas.
                    </AlertDescription>
                </Alert>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {metricItems.map(([key, metric]) => (
                        <Card key={key}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col gap-1">
                                        <CardDescription>
                                            {metric.label}
                                        </CardDescription>
                                        <CardTitle className="text-3xl">
                                            {metric.value.toLocaleString()}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline">
                                        <Activity data-icon="inline-start" />
                                        Activo
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {metric.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    {adminQuickActions.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card key={item.title}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        {Icon && (
                                            <div className="flex size-10 items-center justify-center rounded-full border bg-background">
                                                <Icon />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <CardTitle>{item.title}</CardTitle>
                                            <CardDescription>
                                                Acceso administrativo rápido
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="outline" asChild>
                                        <Link href={item.href} prefetch>
                                            Abrir módulo
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Panel administrador',
            href: '/admin/dashboard',
        },
    ],
};
