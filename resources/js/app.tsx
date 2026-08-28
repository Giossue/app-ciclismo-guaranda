import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthClassicLayout from '@/layouts/auth/auth-classic-layout';
import AuthLayout from '@/layouts/auth-layout';
import MapsLayout from '@/layouts/maps-layout';
import { setupNativeBackButton } from '@/lib/native/capacitor';

const appName = import.meta.env.VITE_APP_NAME || 'Guaranda Go';

initializeTheme();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'auth/login' || name === 'auth/register':
                return AuthClassicLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('account/'):
                return AppLayout;
            case name.startsWith('admin/'):
                return [AppLayout, AdminLayout];
            case name.startsWith('maps/'):
                return MapsLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    // Barra de progreso en cada navegación: sin ella, tocar un enlace no da
    // ninguna señal hasta que la página nueva llega.
    progress: {
        color: 'var(--primary)',
        delay: 120,
        showSpinner: false,
    },
});

setupNativeBackButton();
