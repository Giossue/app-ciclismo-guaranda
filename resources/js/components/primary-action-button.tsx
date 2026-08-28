import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
    /** Texto de la acción: visible desde `md`, siempre disponible para lectores de pantalla. */
    label: string;
} & (
    | { href: NonNullable<InertiaLinkProps['href']>; onClick?: never }
    | { href?: never; onClick: () => void }
);

/**
 * Acción principal de un módulo. En móvil es una acción flotante con el icono
 * `+` sobre la barra inferior, que se esconde al bajar y vuelve al subir; desde
 * `md` es un botón normal en el flujo con su etiqueta. Destino y acción no
 * cambian entre ambos.
 */
export function PrimaryActionButton({
    className,
    href,
    label,
    onClick,
}: Props) {
    const hidden = useHideOnScroll();

    const responsive = cn(
        // 56px es la medida estándar de una acción flotante en móvil.
        'fixed right-[var(--page-pad-x)] bottom-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1rem)] z-[60] size-14 min-h-14 shadow-[var(--elevation-floating)] transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out',
        hidden && 'pointer-events-none translate-y-[calc(100%+2rem)] opacity-0',
        'md:pointer-events-auto md:static md:h-[var(--action-height)] md:min-h-[var(--action-height)] md:w-auto md:translate-y-0 md:rounded-[var(--radius-control)] md:px-4 md:opacity-100 md:shadow-none',
        className,
    );

    const content = (
        <>
            <Plus data-icon="inline-start" className="size-6 md:size-4" />
            <span className="sr-only md:not-sr-only">{label}</span>
        </>
    );

    if (href) {
        return (
            <Button size="icon" asChild className={responsive}>
                <Link href={href} prefetch>
                    {content}
                </Link>
            </Button>
        );
    }

    return (
        <Button
            type="button"
            size="icon"
            onClick={onClick}
            className={responsive}
        >
            {content}
        </Button>
    );
}
