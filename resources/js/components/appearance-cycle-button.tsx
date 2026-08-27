import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
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
    icon: LucideIcon;
    label: string;
}[] = [
    { value: 'light', icon: Sun, label: 'claro' },
    { value: 'dark', icon: Moon, label: 'oscuro' },
    { value: 'system', icon: Monitor, label: 'del sistema' },
];

export default function AppearanceCycleButton() {
    const { appearance, updateAppearance } = useAppearance();
    const currentIndex = appearanceModes.findIndex(
        ({ value }) => value === appearance,
    );
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const current = appearanceModes[safeIndex];
    const next = appearanceModes[(safeIndex + 1) % appearanceModes.length];
    const Icon = current.icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
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
