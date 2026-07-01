import { Link } from '@inertiajs/react';
import { Compass, Settings } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthClassicLayout({ children }: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-x-hidden bg-[var(--bg-color)] px-4 py-8 text-[var(--text-color)] select-none sm:px-6 sm:py-12">
            {/* Glowing Blobs for Depth */}
            <div className="pointer-events-none absolute -top-20 -right-20 size-[320px] rounded-full bg-[#b2f000]/6 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-[320px] rounded-full bg-[#72d645]/4 blur-[80px]" />

            {/* Background Watermark SVGs */}
            <div className="pointer-events-none absolute top-[10%] -left-20 rotate-12 text-[var(--text-secondary)]/5">
                <Compass className="size-64 md:size-80" strokeWidth={0.6} />
            </div>
            <div className="pointer-events-none absolute -right-20 bottom-[10%] -rotate-12 text-[var(--text-secondary)]/5">
                <Settings className="size-64 md:size-80" strokeWidth={0.6} />
            </div>

            <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-6">
                {/* Logo & Brand Header */}
                <div className="flex flex-col items-center gap-2.5 text-center">
                    <Link
                        href={home()}
                        className="group flex size-20 items-center justify-center rounded-full border border-[var(--input-border)] bg-[var(--bg-card-color)] p-3 shadow-md transition-all duration-300 hover:scale-105 hover:border-[#b2f000]/30 hover:shadow-lg active:scale-95"
                        aria-label="Ir al inicio"
                    >
                        <AppLogoIcon className="size-full transition-transform duration-500 group-hover:rotate-[360deg]" />
                    </Link>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="font-sans text-2xl font-black tracking-tight text-[var(--text-color)] uppercase">
                            Guaranda{' '}
                            <span className="font-sans font-light text-[#b2f000]">
                                Go
                            </span>
                        </h1>
                        <p className="font-sans text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase">
                            Rutas Cicloturísticas
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Card Container */}
                <div className="w-full rounded-3xl border border-[var(--input-border)] bg-[var(--bg-card-color)]/90 p-6 shadow-[0_20px_50px_var(--shadow-color)] backdrop-blur-md sm:p-8">
                    {children}
                </div>
            </div>
        </main>
    );
}
