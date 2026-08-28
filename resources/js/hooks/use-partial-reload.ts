import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Indica si hay una recarga parcial de Inertia en vuelo. Es el único momento en
 * que una pantalla ya renderizada espera datos, así que es donde tiene sentido
 * mostrar esqueletos.
 *
 * @param keys Props a vigilar. Sin claves, cualquier recarga parcial cuenta.
 */
export function usePartialReload(keys: string[] = []): boolean {
    const [loading, setLoading] = useState(false);
    const signature = keys.join('|');

    useEffect(() => {
        const watched = signature === '' ? [] : signature.split('|');

        const stopStart = router.on('start', (event) => {
            const only = event.detail.visit.only;

            if (!only || only.length === 0) {
                return;
            }

            if (
                watched.length === 0 ||
                only.some((key) => watched.includes(key))
            ) {
                setLoading(true);
            }
        });

        const stopFinish = router.on('finish', () => setLoading(false));

        return () => {
            stopStart();
            stopFinish();
        };
    }, [signature]);

    return loading;
}
