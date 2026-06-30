import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { adminNavItems } from '@/lib/admin-navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Administrador</Badge>
                            <Badge variant="outline">Guaranda Go</Badge>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Centro de control
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona rutas, POIs, usuarios, incidencias y
                            operación turística desde una base mobile first.
                        </p>
                    </div>
                </div>

                <Separator />

                <nav
                    aria-label="Navegación administrativa"
                    className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                >
                    {adminNavItems.map((item) => {
                        const active = isCurrentUrl(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
                                    active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                {Icon && <Icon data-icon="inline-start" />}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </section>

            {children}
        </div>
    );
}
