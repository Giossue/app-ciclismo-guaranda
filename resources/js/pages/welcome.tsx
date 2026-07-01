import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bike,
    Bot,
    Compass,
    MapPinned,
    ShieldCheck,
    WifiOff,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
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
                <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
                    <section className="ueb-auth-hero">
                        <div className="ueb-auth-logo">
                            <span className="ueb-auth-logo-mark">
                                <AppLogoIcon className="size-9" />
                            </span>
                            <span className="ueb-auth-logo-text">
                                Guaranda <span>Go</span>
                            </span>
                        </div>
                        <MountainScene />
                        <div className="ueb-auth-banner">
                            <h1>
                                Explora Guaranda <strong>en bicicleta</strong>
                            </h1>
                            <p>Rutas, GPS, favoritos y guía para ciclistas.</p>
                        </div>
                    </section>

                    <section className="ueb-auth-card">
                        <div className="flex rounded-2xl bg-[var(--tab-bg)] p-1">
                            {auth.user ? (
                                <Button className="flex-1" asChild>
                                    <Link href={homePath(auth)}>Entrar</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button className="flex-1" asChild>
                                        <Link href={login()}>Ingresar</Link>
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        asChild
                                        variant="ghost"
                                    >
                                        <Link href={register()}>Registro</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="featured-card relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#4fad00_0%,#1a5c00_100%)] p-5 text-white shadow-[0_8px_16px_rgb(79_173_0_/_0.16)]">
                            <div className="relative z-10 flex gap-2">
                                <span className="rounded-xl bg-[#ffd500] px-2.5 py-1.5 font-black text-[var(--fs-xs)] text-black uppercase">
                                    Android
                                </span>
                                <span className="rounded-xl border border-white/30 bg-white/20 px-2.5 py-1.5 font-black text-[var(--fs-xs)] text-white uppercase backdrop-blur">
                                    Mobile first
                                </span>
                            </div>
                            <MountainLines />
                            <div className="relative z-10">
                                <h2 className="mb-2 leading-tight font-black tracking-[-0.04em] text-[var(--fs-xl)]">
                                    Rutas cicloturísticas reales
                                </h2>
                                <div className="flex flex-wrap gap-3 font-bold text-[var(--fs-xs)] opacity-95">
                                    <span className="inline-flex items-center gap-1">
                                        <MapPinned className="size-4" /> Mapas
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Bike className="size-4" /> GPS
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <ShieldCheck className="size-4" />{' '}
                                        Alertas
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
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
                            <Feature icon={Bot} label="IA guía" value="n8n" />
                        </div>

                        <div className="grid gap-2">
                            <Button asChild size="lg">
                                <Link href={startHref}>
                                    {auth.user ? 'Ir al panel' : 'Comenzar'}
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href={auth.user ? '/routes' : login()}>
                                    Ver rutas
                                </Link>
                            </Button>
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
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-input bg-background p-3">
            <Icon className="mb-3 size-5 text-primary" />
            <p className="font-bold text-[var(--fs-xs)] text-muted-foreground">
                {label}
            </p>
            <p className="text-sm font-black tracking-[-0.02em]">{value}</p>
        </div>
    );
}

function MountainScene() {
    return (
        <svg
            className="ueb-auth-mountains"
            viewBox="0 0 430 200"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0 140L72 74L122 118L182 46L268 132L332 86L430 154V200H0V140Z"
                fill="rgb(178 240 0 / 0.11)"
            />
            <path
                d="M0 166L88 104L150 140L224 72L302 154L362 116L430 162V200H0V166Z"
                fill="rgb(178 240 0 / 0.16)"
            />
            <path
                d="M0 182L68 138L132 162L206 112L286 174L350 144L430 176V200H0V182Z"
                fill="rgb(178 240 0 / 0.24)"
            />
        </svg>
    );
}

function MountainLines() {
    return (
        <svg
            className="absolute inset-x-0 bottom-0 z-0 h-24 w-full opacity-80"
            viewBox="0 0 360 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0 70L58 30L108 62L174 16L246 68L306 42L360 70V100H0V70Z"
                fill="rgb(123 225 59 / 0.35)"
            />
            <path
                d="M0 82L72 50L132 76L198 38L274 82L330 58L360 78V100H0V82Z"
                fill="rgb(78 175 35 / 0.52)"
            />
        </svg>
    );
}
