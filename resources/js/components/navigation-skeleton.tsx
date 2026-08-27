import { router } from '@inertiajs/react';
import { Skeleton as BoneyardSkeleton } from 'boneyard-js/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type NavigationSkeletonProps = {
    children: ReactNode;
};

function skeletonNameForPath(pathname: string) {
    const normalizedPath = pathname === '/' ? 'home' : pathname.slice(1);

    return `page-${normalizedPath.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
}

/**
 * Replaces the generic navigation spinner with a DOM-derived Boneyard skeleton.
 * Only GET visits use it; form mutations retain their local pending state.
 */
export function NavigationSkeleton({ children }: NavigationSkeletonProps) {
    const [loading, setLoading] = useState(false);
    const activeVisitId = useRef<string | null>(null);
    const delay = useRef<number | undefined>(undefined);

    useEffect(() => {
        const clearDelay = () => {
            window.clearTimeout(delay.current);
            delay.current = undefined;
        };

        const show = router.on('start', (event) => {
            const visit = event.detail.visit;

            if (visit.method !== 'get' || visit.prefetch) {
                return;
            }

            clearDelay();
            activeVisitId.current = visit.id;
            delay.current = window.setTimeout(() => setLoading(true), 150);
        });

        const hide = router.on('finish', (event) => {
            if (event.detail.visit.id !== activeVisitId.current) {
                return;
            }

            clearDelay();
            activeVisitId.current = null;
            setLoading(false);
        });

        return () => {
            clearDelay();
            show();
            hide();
        };
    }, []);

    const pageName = skeletonNameForPath(window.location.pathname);

    return (
        <BoneyardSkeleton
            name={pageName}
            loading={loading}
            select="viewport"
            transition={160}
            fallback={children}
        >
            {children}
        </BoneyardSkeleton>
    );
}
