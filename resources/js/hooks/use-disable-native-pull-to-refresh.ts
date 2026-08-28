import { useEffect } from 'react';

/** Evita el refresco nativo del navegador/WebView en superficies ciclista. */
export function useDisableNativePullToRefresh(enabled = true) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const className = 'user-no-pull-to-refresh';

        document.documentElement.classList.add(className);
        document.body.classList.add(className);

        return () => {
            document.documentElement.classList.remove(className);
            document.body.classList.remove(className);
        };
    }, [enabled]);
}
