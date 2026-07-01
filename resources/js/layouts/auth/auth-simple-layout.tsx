import { Link } from '@inertiajs/react';
import { Bike, MapPinned } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_30%_10%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_62%)]" />
            <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-6 px-5 py-8">
                <header className="flex flex-col gap-5">
                    <Link
                        href={home()}
                        className="flex w-fit items-center gap-3 rounded-2xl border bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
                    >
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <AppLogoIcon className="size-7 fill-current" />
                        </span>
                        <span className="grid gap-0.5">
                            <span className="font-display text-sm font-black tracking-[-0.02em]">
                                Guaranda Go
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                                Cicloturismo móvil
                            </span>
                        </span>
                    </Link>

                    <div className="rounded-3xl border bg-card/90 p-5 shadow-sm backdrop-blur">
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Bike className="size-4 text-primary" />
                            <span>Rutas, GPS y turismo local</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="font-display text-3xl leading-tight font-black tracking-[-0.04em] text-foreground">
                                {title}
                            </h1>
                            {description ? (
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground">
                            <MapPinned className="size-4" />
                            <span>Diseñado para usar en Android</span>
                        </div>
                    </div>
                </header>

                <section className="rounded-3xl border bg-card/95 p-4 shadow-[0_18px_60px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur">
                    {children}
                </section>
            </div>
        </main>
    );
}
