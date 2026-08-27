import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthClassicLayout({ children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10 lg:p-12">
            <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md lg:max-w-3xl lg:gap-8">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-black text-foreground"
                >
                    <span className="flex size-9 items-center justify-center overflow-hidden rounded-[var(--radius-compact)] border border-primary bg-primary text-primary-foreground">
                        <AppLogoIcon className="size-full" />
                    </span>
                    Guaranda Go
                </Link>
                {children}
            </div>
        </main>
    );
}
