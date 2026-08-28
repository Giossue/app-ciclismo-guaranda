import { Head, Link, usePage } from '@inertiajs/react';
import { Bot, Heart, Map, Route } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as chatIndex } from '@/routes/chat';
import { index as favoritesIndex } from '@/routes/favorites';
import { index as mapsIndex } from '@/routes/maps';
import { index as routesIndex } from '@/routes/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const quickActions = [
    {
        title: 'Explorar mapa',
        description: 'Encuentra rutas, paradas y alertas cerca de ti.',
        href: mapsIndex.url(),
        icon: Map,
        primary: true,
    },
    {
        title: 'Ver rutas',
        description: 'Busca el próximo recorrido.',
        href: routesIndex.url(),
        icon: Route,
    },
    {
        title: 'Favoritas',
        description: 'Retoma tus rutas guardadas.',
        href: favoritesIndex.url(),
        icon: Heart,
    },
    {
        title: 'Explorar con IA',
        description: 'Pide una recomendación para salir.',
        href: chatIndex.url(),
        icon: Bot,
    },
];

export default function UserDashboard() {
    const { auth } = usePage<PageProps>().props;
    const name = auth.user?.name ?? 'ciclista';

    return (
        <>
            <Head title="Inicio" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Heading
                    title={`Hola, ${name}`}
                    description="¿A dónde quieres pedalear hoy?"
                />

                <section
                    aria-label="Acciones rápidas"
                    className="grid gap-4 sm:grid-cols-2"
                >
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Card
                                key={action.title}
                                className={cn(
                                    action.primary && 'sm:col-span-2',
                                )}
                            >
                                <CardHeader>
                                    <Icon aria-hidden="true" />
                                    <CardTitle>{action.title}</CardTitle>
                                    <CardDescription>
                                        {action.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant={
                                            action.primary
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        <Link href={action.href} prefetch>
                                            {action.primary
                                                ? 'Abrir mapa'
                                                : action.title}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </section>
            </div>
        </>
    );
}
