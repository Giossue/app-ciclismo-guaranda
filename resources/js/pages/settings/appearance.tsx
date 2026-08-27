import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import { Button } from '@/components/ui/button';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Ajustes de apariencia" />

            <div className="ueb-page flex flex-col gap-5 md:w-full">
                {/* Header with back button */}
                <div className="flex items-center gap-3 border-b border-border/40 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-11 rounded-2xl border border-border bg-secondary text-muted-foreground transition-all duration-200 hover:bg-border hover:text-foreground"
                    >
                        <Link href="/menu" replace>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-base leading-none font-black text-foreground">
                            Apariencia
                        </h1>
                        <p className="mt-1 text-[var(--fs-caption)] text-muted-foreground">
                            Personaliza el tema visual de Guaranda Go
                        </p>
                    </div>
                </div>

                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Ajustes de apariencia',
            href: editAppearance(),
        },
    ],
};
