import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthClassicLayout({ children }: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10 lg:p-12">
            <Button
                asChild
                variant="outline"
                size="sm"
                className="absolute top-[calc(env(safe-area-inset-top,0px)+2rem)] left-4"
            >
                <Link href={home()}>
                    <ArrowLeft data-icon="inline-start" />
                    Volver a inicio
                </Link>
            </Button>
            <div className="w-full max-w-sm md:max-w-md lg:max-w-3xl">
                {children}
            </div>
        </main>
    );
}
