import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppearanceCycleButton from '@/components/appearance-cycle-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthClassicLayout({ children }: AuthLayoutProps) {
    const isLogin = usePage().component === 'auth/login';

    return (
        <main className="flex min-h-svh w-full items-center justify-center bg-background p-4 pt-20 sm:p-6 sm:pt-20 md:p-10 md:pt-24 lg:p-12 lg:pt-28">
            <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
                <Button asChild variant="outline" size="sm">
                    <Link href={home()}>
                        <ArrowLeft data-icon="inline-start" />
                        Volver a inicio
                    </Link>
                </Button>
                <AppearanceCycleButton />
            </header>
            <div
                className={cn(
                    'flex w-full max-w-sm flex-col md:max-w-md',
                    isLogin ? 'lg:max-w-5xl' : 'lg:max-w-3xl',
                )}
            >
                {children}
            </div>
        </main>
    );
}
