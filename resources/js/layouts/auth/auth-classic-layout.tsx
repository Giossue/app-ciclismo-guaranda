import type { AuthLayoutProps } from '@/types';

export default function AuthClassicLayout({ children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">{children}</div>
        </main>
    );
}
