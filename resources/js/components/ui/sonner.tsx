import { useEffect } from 'react';
import { toast } from 'sonner';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();
    useNetworkToasts();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-center"
            richColors
            closeButton
            offset="calc(var(--bottom-nav-height) + var(--safe-bottom) + 0.75rem)"
            toastOptions={{
                classNames: {
                    toast: 'rounded-2xl border-border bg-popover text-popover-foreground shadow-[0_18px_55px_color-mix(in_oklch,var(--foreground)_18%,transparent)]',
                    title: 'font-bold',
                    description: 'text-muted-foreground',
                    actionButton: 'bg-primary text-primary-foreground',
                    cancelButton: 'bg-muted text-muted-foreground',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': 'var(--success)',
                    '--success-text': 'var(--success-foreground)',
                    '--error-bg': 'var(--destructive)',
                    '--error-text': 'var(--destructive-foreground)',
                    '--warning-bg': 'var(--warning)',
                    '--warning-text': 'var(--warning-foreground)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

function useNetworkToasts(): void {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const offline = () => {
            toast.warning('Sin conexión', {
                description: 'Puedes seguir usando datos descargados y sincronizar después.',
            });
        };
        const online = () => {
            toast.success('Conexión recuperada', {
                description: 'La app puede sincronizar información pendiente.',
            });
        };

        window.addEventListener('offline', offline);
        window.addEventListener('online', online);

        return () => {
            window.removeEventListener('offline', offline);
            window.removeEventListener('online', online);
        };
    }, []);
}

export { Toaster };
