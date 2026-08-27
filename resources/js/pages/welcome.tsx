import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    Bot,
    Compass,
    Download,
    MapPinned,
    Route,
    ShieldCheck,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { homePath } from '@/lib/navigation';
import { home, login, register } from '@/routes';
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
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-8">
                    <header className="flex items-center justify-between gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-3 text-foreground"
                        >
                            <span className="grid size-10 place-items-center rounded-xl border border-border bg-card text-primary shadow-[var(--elevation-subtle)]">
                                <AppLogoIcon className="size-6" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-lg font-black tracking-[-0.04em]">
                                    Guaranda Go
                                </span>
                                <span className="mt-1 text-xs font-bold text-muted-foreground">
                                    Bolívar, Ecuador
                                </span>
                            </span>
                        </Link>

                        <Button asChild variant="outline" size="sm">
                            <Link href={primaryHref}>
                                {auth.user ? 'Mi panel' : 'Ingresar'}
                                <ArrowRight data-icon="inline-end" />
                            </Link>
                        </Button>
                    </header>

                    <section className="grid gap-4 lg:grid-cols-12 lg:gap-6">
                        <section className="relative flex min-h-[31rem] overflow-hidden rounded-3xl border border-border bg-[var(--map-background)] px-6 py-7 text-background shadow-[var(--elevation-floating)] sm:min-h-[34rem] sm:px-9 sm:py-10 lg:col-span-7 lg:min-h-[40rem] lg:px-12 lg:py-12">
                            <MountainScene />

                            <div className="relative z-10 flex w-full flex-col justify-between gap-10">
                                <div className="flex items-center justify-between gap-4">
                                    <Badge className="bg-primary text-primary-foreground">
                                        Cicloturismo local
                                    </Badge>
                                    <span className="flex items-center gap-2 text-xs font-bold text-background/70">
                                        <span className="size-2 rounded-full bg-primary" />
                                        Rutas preparadas
                                    </span>
                                </div>

                                <div className="max-w-xl">
                                    <p className="mb-4 text-sm font-black tracking-[0.14em] text-primary uppercase">
                                        Muévete a tu ritmo
                                    </p>
                                    <h1 className="text-[length:var(--fs-hero)] leading-none font-black tracking-[-0.065em] text-background">
                                        Guaranda se vive mejor sobre dos ruedas.
                                    </h1>
                                    <p className="mt-6 max-w-lg text-base leading-relaxed font-medium text-background/75 sm:text-lg">
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
                                            variant="outline"
                                            className="w-full border-background/35 bg-transparent text-background hover:border-primary hover:bg-primary hover:text-primary-foreground sm:w-auto"
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
                            <Card className="sm:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                                            <MapPinned className="size-5" />
                                        </span>
                                        <ShieldCheck className="size-5 text-muted-foreground" />
                                    </div>
                                    <CardTitle>
                                        Todo empieza con una buena preparación.
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        Accede con tu cuenta para consultar
                                        rutas, guardar favoritas y registrar tus
                                        recorridos.
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </section>
                    </section>

                    <section className="grid gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-6">
                        <LandingNote
                            icon={Compass}
                            text="Diseñada para ciclistas de Bolívar."
                        />
                        <LandingNote
                            icon={Download}
                            text="Información útil también fuera de cobertura."
                        />
                        <LandingNote
                            icon={ShieldCheck}
                            text="Acceso seguro para tu actividad y perfil."
                        />
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
                <span className="grid size-10 place-items-center rounded-lg bg-accent text-brand-accent">
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

function LandingNote({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <p className="flex items-center gap-2 font-semibold">
            <Icon className="size-4 shrink-0 text-brand-accent" />
            {text}
        </p>
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
                className="fill-background/12"
            />
            <path
                d="M0 430L114 338L246 414L390 292L524 440L664 342L800 426V520H0V430Z"
                className="fill-background/10"
            />
        </svg>
    );
}
