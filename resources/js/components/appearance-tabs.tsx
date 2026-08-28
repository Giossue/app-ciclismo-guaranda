import type { LucideIcon } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
}: {
    className?: string;
}) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Claro' },
        { value: 'dark', icon: Moon, label: 'Oscuro' },
    ];

    return (
        <ToggleGroup
            type="single"
            value={appearance}
            variant="outline"
            size="lg"
            className={cn('grid w-full grid-cols-2 gap-1', className)}
        >
            {tabs.map(({ value, icon: Icon, label }) => {
                return (
                    <ToggleGroupItem
                        key={value}
                        value={value}
                        aria-label={`Usar tema ${label.toLowerCase()}`}
                        onClick={(event) =>
                            updateAppearance(value, event.currentTarget)
                        }
                        className="min-h-11 w-full"
                    >
                        <Icon />
                        <span>{label}</span>
                    </ToggleGroupItem>
                );
            })}
        </ToggleGroup>
    );
}
