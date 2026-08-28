import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
 * Acción principal de un módulo. En móvil se reduce al icono `+` y desde `md`
 * recupera la etiqueta completa; el destino o la acción son los mismos.
 */
export function PrimaryActionButton({
    className,
    href,
    label,
    onClick,
}: Props) {
    const responsive = cn(
        'md:h-[var(--action-height)] md:w-auto md:rounded-[var(--radius-control)] md:px-4',
        className,
    );

    const content = (
        <>
            <Plus data-icon="inline-start" />
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
