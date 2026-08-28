import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { RouteGeometryEditorProps } from './route-geometry-editor';

export default function ClientOnlyRouteGeometryEditor(
    props: RouteGeometryEditorProps,
) {
    const [Editor, setEditor] =
        useState<ComponentType<RouteGeometryEditorProps> | null>(null);

    useEffect(() => {
        let mounted = true;

        void import('./route-geometry-editor').then(
            ({ default: Component }) => {
                if (mounted) {
                    setEditor(() => Component);
                }
            },
        );

        return () => {
            mounted = false;
        };
    }, []);

    if (Editor === null) {
        return (
            <Skeleton
                className="h-[440px] w-full"
                aria-label="Cargando editor de geometría"
            />
        );
    }

    return <Editor {...props} />;
}
