import { useEffect, useRef, useState } from 'react';

type Options = {
    /** Desplazamiento mínimo para reaccionar; evita parpadeos por rebote. */
    threshold?: number;
    /** Por debajo de esta altura el elemento siempre se muestra. */
    revealOffset?: number;
};

/**
 * Oculta un elemento flotante al desplazarse hacia abajo y lo devuelve al subir,
 * como la acción flotante de una app móvil.
 */
export function useHideOnScroll({
    threshold = 8,
    revealOffset = 80,
}: Options = {}): boolean {
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const handleScroll = () => {
            const current = window.scrollY;
            const delta = current - lastScrollY.current;

            if (Math.abs(delta) < threshold) {
                return;
            }

            lastScrollY.current = current;
            setHidden(delta > 0 && current > revealOffset);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold, revealOffset]);

    return hidden;
}
