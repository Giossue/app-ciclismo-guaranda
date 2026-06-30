import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Construction, Milestone } from 'lucide-react';
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

type AdminModule = {
    slug: string;
    title: string;
    description: string;
    next_phase: string;
};

type Props = {
    module: AdminModule;
};

export default function AdminModuleShow({ module }: Props) {
    return (
        <>
            <Head title={module.title} />

            <div className="flex flex-col gap-5">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-2">
                                <Badge variant="secondary" className="w-fit">
                                    <Construction data-icon="inline-start" />
                                    Módulo base
                                </Badge>
                                <CardTitle className="text-2xl">
                                    {module.title}
                                </CardTitle>
                                <CardDescription>
                                    {module.description}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Milestone />
                            <AlertTitle>
                                Preparado para la siguiente fase
                            </AlertTitle>
                            <AlertDescription>
                                Esta pantalla confirma navegación, autorización
                                y layout administrativo. La lógica CRUD completa
                                se implementará en {module.next_phase}.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <ArrowLeft data-icon="inline-start" />
                                Volver al resumen
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

AdminModuleShow.layout = {
    breadcrumbs: [
        {
            title: 'Panel administrador',
            href: '/admin/dashboard',
        },
    ],
};
