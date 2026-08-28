import { Moon, Sun } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

const appearanceModes: {
    value: Appearance;
    label: string;
}[] = [
    { value: 'light', label: 'claro' },
    { value: 'dark', label: 'oscuro' },
];

type Props = Pick<ComponentProps<typeof Button>, 'className' | 'variant'>;

export default function AppearanceCycleButton({
    className,
    variant = 'ghost',
}: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const currentIndex = appearanceModes.findIndex(
        ({ value }) => value === appearance,
    );
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const current = appearanceModes[safeIndex];
    const next = appearanceModes[(safeIndex + 1) % appearanceModes.length];
    const Icon = appearance === 'dark' ? Sun : Moon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant={variant}
                    size="icon"
                    className={className}
                    aria-label={`Tema actual: ${current.label}. Cambiar a tema ${next.label}.`}
                    onClick={() => updateAppearance(next.value)}
                >
                    <Icon />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Cambiar a tema {next.label}</TooltipContent>
        </Tooltip>
    );
}
