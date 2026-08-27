import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Bot, Download, MapPinned, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { homePath } from '@/lib/navigation';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;
    const primaryHref = auth.user ? homePath(auth) : login();

    return (
        <>
            <Head title="Guaranda Go" />

            <main className="min-h-[100dvh] bg-background px-[var(--page-pad-x)] py-[var(--page-pad-y)] text-foreground lg:py-8">
                <div className="mx-auto w-full max-w-7xl">
                    <section className="grid gap-4 lg:grid-cols-12 lg:gap-6">
                        <section className="relative flex min-h-[31rem] overflow-hidden rounded-3xl border border-border bg-[var(--map-background)] px-6 py-7 text-inverse-foreground shadow-[var(--elevation-floating)] sm:min-h-[34rem] sm:px-9 sm:py-10 lg:col-span-7 lg:min-h-[40rem] lg:px-12 lg:py-12">
                            <MountainScene />

                            <div className="relative z-10 flex w-full flex-col justify-center gap-10">
                                <div className="max-w-xl">
                                    <h1 className="text-[length:var(--fs-hero)] leading-none font-black tracking-[-0.065em] text-inverse-foreground">
                                        Guaranda se vive mejor sobre dos ruedas.
                                    </h1>
                                    <p className="mt-6 max-w-lg text-base leading-relaxed font-medium text-inverse-muted-foreground sm:text-lg">
                                        Planifica rutas oficiales, llévalas sin
                                        conexión y descubre la provincia con una
                                        guía hecha para ciclistas.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full sm:w-auto"
                                    >
                                        <Link href={primaryHref}>
                                            {auth.user
                                                ? 'Ir a mi panel'
                                                : 'Iniciar sesión'}
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                    {!auth.user && (
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="inverse"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link href={register()}>
                                                Crear cuenta
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2 lg:gap-6">
                            <FeatureCard
                                className="sm:col-span-2"
                                icon={Route}
                                eyebrow="Rutas oficiales"
                                title="Elige una ruta con información clara."
                                description="Distancia, dificultad, puntos de interés e incidencias antes de salir."
                            />
                            <FeatureCard
                                icon={Download}
                                eyebrow="Sin conexión"
                                title="Lleva la ruta contigo."
                                description="Descarga lo necesario antes de pedalear fuera de cobertura."
                            />
                            <FeatureCard
                                icon={Bot}
                                eyebrow="Guía ciclista"
                                title="Pregunta y sigue avanzando."
                                description="Recibe orientación para organizar mejor tu recorrido."
                            />
                            <FeatureCard
                                className="sm:col-span-2"
                                icon={MapPinned}
                                eyebrow="Tu cuenta"
                                title="Todo empieza con una buena preparación."
                                description="Accede con tu cuenta para consultar rutas, guardar favoritas y registrar tus recorridos."
                            />
                        </section>
                    </section>
                </div>
            </main>
        </>
    );
}

function FeatureCard({
    className,
    icon: Icon,
    eyebrow,
    title,
    description,
}: {
    className?: string;
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <span className="grid size-10 place-items-center text-brand-accent">
                    <Icon className="size-5" />
                </span>
                <p className="text-xs font-black tracking-[0.12em] text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    );
}

function MountainScene() {
    return (
        <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] w-full"
            viewBox="0 0 800 520"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0 350L130 184L230 300L390 98L560 338L660 214L800 360V520H0V350Z"
                className="fill-primary/20"
            />
            <path
                d="M0 394L152 262L284 370L436 194L596 384L704 278L800 366V520H0V394Z"
                className="fill-inverse-foreground/12"
            />
            <path
                d="M0 430L114 338L246 414L390 292L524 440L664 342L800 426V520H0V430Z"
                className="fill-inverse-foreground/10"
            />
        </svg>
    );
}
