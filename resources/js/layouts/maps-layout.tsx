import { Link, usePage } from '@inertiajs/react';
import { Heart, Map, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useDisableNativePullToRefresh } from '@/hooks/use-disable-native-pull-to-refresh';
import { isAdmin } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { index as favoritesIndex } from '@/routes/favorites';
import { index as mapsIndex } from '@/routes/maps';
import { index as routesIndex } from '@/routes/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    selectedRouteSlug?: string | null;
};

export default function MapsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth, selectedRouteSlug } = usePage<PageProps>().props;

    useDisableNativePullToRefresh(!isAdmin(auth));

    return (
        <div className="relative h-[100dvh] overflow-hidden bg-background">
            {children}

            <nav
                aria-label="Navegación del mapa"
                className={cn(
                    'fixed inset-x-0 bottom-[calc(var(--safe-bottom)+0.75rem)] z-[700] flex justify-center px-4',
                    selectedRouteSlug && 'hidden',
                )}
            >
                <div className="flex items-center gap-1 rounded-[var(--radius-emphasis)] border bg-background/90 p-1.5 shadow-lg backdrop-blur">
                    <Button
                        asChild
                        variant={
                            isCurrentUrl(mapsIndex.url()) ? 'default' : 'ghost'
                        }
                        size="sm"
                    >
                        <Link href={mapsIndex.url()} prefetch>
                            <Map data-icon="inline-start" />
                            Explorar
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant={
                            isCurrentUrl(routesIndex.url())
                                ? 'default'
                                : 'ghost'
                        }
                        size="sm"
                    >
                        <Link href={routesIndex.url()} prefetch>
                            <Route data-icon="inline-start" />
                            Rutas
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant={
                            isCurrentUrl(favoritesIndex.url())
                                ? 'default'
                                : 'ghost'
                        }
                        size="sm"
                    >
                        <Link href={favoritesIndex.url()} prefetch>
                            <Heart data-icon="inline-start" />
                            Favoritas
                        </Link>
                    </Button>
                </div>
            </nav>
        </div>
    );
}
