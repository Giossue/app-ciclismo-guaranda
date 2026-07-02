import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Bot, Compass, WifiOff } from 'lucide-react';
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
                        {auth.user ? (
                            <Button
                                asChild
                                size="lg"
                                className="h-12 w-full rounded-2xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase shadow-md transition-all duration-200 hover:bg-[#9ad000] active:scale-95"
                            >
                                <Link href={homePath(auth)}>Entrar</Link>
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-2xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase shadow-md transition-all duration-200 hover:bg-[#9ad000] active:scale-95"
                                >
                                    <Link href={login()}>Ingresar</Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="h-12 rounded-2xl border-[var(--input-border)] bg-[var(--bg-card-color)] text-xs font-black tracking-wider text-[var(--text-color)] uppercase shadow-sm transition-all duration-200 hover:bg-[var(--panel-soft)] active:scale-95"
                                >
                                    <Link href={register()}>Registro</Link>
                                </Button>
                            </div>
                        )}

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
                            <Feature
                                icon={Bot}
                                label="IA guía"
                                value="Agente"
                            />
                        </div>

                        <Button
                            asChild
                            size="lg"
                            className="h-12 w-full rounded-2xl bg-[#b2f000] text-xs font-black tracking-wider text-[#050605] uppercase shadow-md transition-all duration-200 hover:bg-[#9ad000] active:scale-95"
                        >
                            <Link href={auth.user ? homePath(auth) : login()}>
                                {auth.user ? 'Ir al panel' : 'Comenzar'}
                            </Link>
                        </Button>
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
        <div className="flex min-h-[104px] flex-col items-center justify-center rounded-2xl border border-[var(--input-border)] bg-[var(--bg-card-color)] p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5">
            <Icon className="mb-3 size-5 text-[var(--brand-accent)]" />
            <p className="font-bold text-[var(--fs-xs)] text-[var(--text-secondary)]">
                {label}
            </p>
            <p className="text-sm font-black tracking-[-0.02em] text-[var(--text-color)]">
                {value}
            </p>
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
