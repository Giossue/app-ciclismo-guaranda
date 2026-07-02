import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

export function GlobalLoadingIndicator() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timeout: number | undefined;

        const show = () => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => setLoading(true), 180);
        };

        const hide = () => {
            window.clearTimeout(timeout);
            setLoading(false);
        };

        const removeStartListener = router.on('start', show);
        const removeFinishListener = router.on('finish', hide);

        return () => {
            window.clearTimeout(timeout);
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    if (!loading) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+var(--safe-bottom)+12px)] z-[120] flex justify-center px-4 md:bottom-6"
        >
            <div className="flex items-center gap-2 rounded-full border border-border bg-popover px-3 py-2 text-sm font-black text-popover-foreground">
                <Spinner className="size-4 text-primary" />
                <span>Cargando</span>
            </div>
        </div>
    );
}
