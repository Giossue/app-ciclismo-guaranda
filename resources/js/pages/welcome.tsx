import { Head, Link, usePage } from '@inertiajs/react';
import { Bike, ShieldCheck } from 'lucide-react';
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

            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-8 md:px-8">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border bg-card">
                                <Bike className="size-5" />
                            </div>
                            <div className="grid gap-0.5">
                                <p className="text-sm font-semibold">
                                    Guaranda Go
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Cicloturismo Bolívar
                                </p>
                            </div>
                        </div>

                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={homePath(auth)}
                                    className="inline-flex min-h-10 items-center rounded-full border bg-card px-4 text-sm font-medium hover:bg-accent"
                                >
                                    Entrar
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium hover:bg-accent"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex min-h-10 items-center rounded-full border bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                        Crear cuenta
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="flex flex-1 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
                                <ShieldCheck className="size-4" />
                                App híbrida Android + Laravel
                            </div>

                            <div className="grid gap-4">
                                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                                    Explora Guaranda en bicicleta con rutas,
                                    mapas y asistencia inteligente.
                                </h1>
                                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                                    Plataforma para ciclistas y administradores:
                                    rutas oficiales, puntos de interés,
                                    incidencias, favoritos, recorridos GPS y
                                    asistente IA conectado a n8n.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={auth.user ? homePath(auth) : login()}
                                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                                >
                                    {auth.user ? 'Ir al panel' : 'Comenzar'}
                                </Link>
                                <Link
                                    href="/routes"
                                    className="inline-flex min-h-11 items-center rounded-full border bg-card px-5 text-sm font-semibold hover:bg-accent"
                                >
                                    Ver rutas
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
