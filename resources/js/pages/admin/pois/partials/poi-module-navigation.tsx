import { Link } from '@inertiajs/react';
import PoiController from '@/actions/App/Http/Controllers/Admin/PoiController';
import PoiReportController from '@/actions/App/Http/Controllers/Admin/PoiReportController';
import PoiSuggestionController from '@/actions/App/Http/Controllers/Admin/PoiSuggestionController';
import { Button } from '@/components/ui/button';

type PoiSection = 'pois' | 'suggestions' | 'reports';

const sections = [
    {
        value: 'pois' as const,
        label: 'POIs',
        href: PoiController.index(),
    },
    {
        value: 'suggestions' as const,
        label: 'Sugerencias',
        href: PoiSuggestionController(),
    },
    {
        value: 'reports' as const,
        label: 'Reportes',
        href: PoiReportController(),
    },
];

export function PoiModuleNavigation({ active }: { active: PoiSection }) {
    return (
        <nav aria-label="Secciones de puntos de interés">
            <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                    const isActive = section.value === active;

                    return (
                        <Button
                            key={section.value}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link
                                href={section.href}
                                prefetch
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {section.label}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}
