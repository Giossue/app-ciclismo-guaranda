import { router } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

/** Arrastre necesario para disparar la recarga. */
const TRIGGER_DISTANCE = 72;
/** Tope del indicador: más allá el gesto deja de crecer. */
const MAX_DISTANCE = 120;
/** El indicador avanza a la mitad del dedo, para que el gesto se sienta con peso. */
const DRAG_RESISTANCE = 0.5;

/**
 * Gesto de «deslizar hacia abajo para actualizar» en móvil. Recarga los props
 * de la pantalla actual con Inertia, sin recargar el documento completo.
 */
export function PullToRefresh() {
    const isMobile = useIsMobile();
    const [distance, setDistance] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef<number | null>(null);
    const distanceRef = useRef(0);
    const refreshingRef = useRef(false);

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const updateDistance = (value: number) => {
            distanceRef.current = value;
            setDistance(value);
        };

        // Con un overlay abierto Radix bloquea el scroll: el gesto no aplica.
        const isBlocked = () =>
            refreshingRef.current ||
            document.body.hasAttribute('data-scroll-locked');

        const handleTouchStart = (event: TouchEvent) => {
            if (
                isBlocked() ||
                event.touches.length !== 1 ||
                window.scrollY > 0
            ) {
                startY.current = null;

                return;
            }

            startY.current = event.touches[0].clientY;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (startY.current === null || isBlocked()) {
                return;
            }

            const delta = event.touches[0].clientY - startY.current;

            if (delta <= 0 || window.scrollY > 0) {
                setDragging(false);
                updateDistance(0);

                return;
            }

            // Corta el rebote nativo solo mientras el gesto está activo.
            event.preventDefault();
            setDragging(true);
            updateDistance(Math.min(delta * DRAG_RESISTANCE, MAX_DISTANCE));
        };

        const handleTouchEnd = () => {
            if (startY.current === null) {
                return;
            }

            startY.current = null;
            setDragging(false);

            if (distanceRef.current < TRIGGER_DISTANCE) {
                updateDistance(0);

                return;
            }

            refreshingRef.current = true;
            setRefreshing(true);
            updateDistance(TRIGGER_DISTANCE);

            router.reload({
                onFinish: () => {
                    refreshingRef.current = false;
                    setRefreshing(false);
                    updateDistance(0);
                },
            });
        };

        window.addEventListener('touchstart', handleTouchStart, {
            passive: true,
        });
        window.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isMobile]);

    if (!isMobile) {
        return null;
    }

    const progress = Math.min(distance / TRIGGER_DISTANCE, 1);

    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center md:hidden"
                style={{
                    transform: `translateY(${distance}px)`,
                    opacity: distance > 0 ? 1 : 0,
                    transition: dragging
                        ? 'none'
                        : 'transform 200ms ease-out, opacity 200ms ease-out',
                }}
            >
                <span className="mt-2 grid size-10 place-items-center rounded-full border border-border bg-card shadow-[var(--elevation-raised)]">
                    <RefreshCw
                        className={cn(
                            'size-4 text-link',
                            refreshing && 'animate-spin',
                        )}
                        style={
                            refreshing
                                ? undefined
                                : { transform: `rotate(${progress * 270}deg)` }
                        }
                    />
                </span>
            </div>

            <span role="status" className="sr-only">
                {refreshing ? 'Actualizando la pantalla' : ''}
            </span>
        </>
    );
}
