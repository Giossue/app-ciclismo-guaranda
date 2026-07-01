import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bike,
    Bot,
    Compass,
    MapPinned,
    ShieldCheck,
    WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { homePath } from '@/lib/navigation';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;
    const startHref = auth.user ? homePath(auth) : login();

    return (
        <>
            <Head title="Guaranda Go" />

            <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
                <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_22%_8%,color-mix(in_oklch,var(--primary)_30%,transparent),transparent_58%)]" />
                <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col gap-8 px-5 py-5 md:px-8 md:py-8">
                    <header className="flex items-center justify-between gap-4 rounded-3xl border bg-card/85 p-2 shadow-sm backdrop-blur">
                        <div className="flex min-w-0 items-center gap-3 px-2">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                                <Bike className="size-5" />
                            </div>
                            <div className="grid min-w-0 gap-0.5">
                                <p className="font-display text-sm font-black tracking-[-0.02em]">
                                    Guaranda Go
                                </p>
                                <p className="truncate text-xs font-semibold text-muted-foreground">
                                    Cicloturismo Bolívar
                                </p>
                            </div>
                        </div>

                        <nav className="flex shrink-0 items-center gap-1.5">
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={homePath(auth)}>Entrar</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href={login()}>Ingresar</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={register()}>Registro</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="grid flex-1 items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card/90 px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
                                <ShieldCheck className="size-4 text-primary" />
                                App Android híbrida para rutas reales
                            </div>

                            <div className="grid gap-4">
                                <h1 className="max-w-3xl font-display text-4xl leading-[1.02] font-black tracking-[-0.055em] text-foreground md:text-6xl">
                                    Explora Guaranda en bicicleta con mapas, GPS
                                    y apoyo local.
                                </h1>
                                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                                    Rutas oficiales, puntos de interés, alertas,
                                    favoritos, recorridos y asistente para
                                    ciclistas.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:flex sm:flex-wrap">
                                <Button asChild size="lg">
                                    <Link href={startHref}>
                                        {auth.user ? 'Ir al panel' : 'Comenzar'}
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link
                                        href={auth.user ? '/routes' : login()}
                                    >
                                        Ver rutas
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-[2rem] border bg-card/90 p-4 shadow-[0_24px_70px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur">
                            <div className="overflow-hidden rounded-3xl border bg-accent/70 p-4">
                                <div className="aspect-[4/3] rounded-[1.6rem] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_38%,transparent),color-mix(in_oklch,var(--secondary)_28%,transparent)),radial-gradient(circle_at_70%_25%,color-mix(in_oklch,var(--warning)_45%,transparent),transparent_35%)] p-4 text-accent-foreground">
                                    <div className="flex h-full flex-col justify-between">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="rounded-full bg-card/85 px-3 py-1 text-xs font-black text-foreground">
                                                Ruta activa
                                            </span>
                                            <MapPinned className="size-6" />
                                        </div>
                                        <div className="rounded-2xl bg-card/90 p-3 text-foreground shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground">
                                                Guaranda Centro
                                            </p>
                                            <p className="font-display text-2xl font-black tracking-[-0.04em]">
                                                18.4 km
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Mapa, POIs y alertas
                                                disponibles.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <Feature
                                    icon={Compass}
                                    label="Rutas"
                                    value="Oficiales"
                                />
                                <Feature
                                    icon={WifiOff}
                                    label="Offline"
                                    value="Paquetes"
                                />
                                <Feature
                                    icon={Bot}
                                    label="IA guía"
                                    value="n8n"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function Feature({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Compass;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border bg-background/75 p-3">
            <Icon className="mb-3 size-5 text-primary" />
            <p className="text-xs font-bold text-muted-foreground">{label}</p>
            <p className="font-display text-sm font-black tracking-[-0.02em]">
                {value}
            </p>
        </div>
    );
}
