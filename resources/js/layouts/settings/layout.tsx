import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Perfil', href: edit(), icon: null },
    { title: 'Seguridad', href: editSecurity(), icon: null },
    { title: 'Apariencia', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-5">
            <Heading
                title="Ajustes"
                description="Administra tu perfil, seguridad y apariencia de la app"
            />

            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-8">
                <aside className="w-full lg:sticky lg:top-20 lg:self-start">
                    <nav
                        className="flex gap-2 overflow-x-auto rounded-2xl border bg-card/90 p-1 shadow-sm lg:flex-col lg:overflow-visible"
                        aria-label="Ajustes"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant={active ? 'default' : 'ghost'}
                                    asChild
                                    className={cn(
                                        'min-w-28 justify-center lg:w-full lg:justify-start',
                                        active && 'shadow-none',
                                    )}
                                >
                                    <Link href={item.href}>{item.title}</Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="lg:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="flex max-w-2xl flex-col gap-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
