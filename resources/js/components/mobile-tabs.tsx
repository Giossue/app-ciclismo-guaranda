import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type MobileTabItem = {
    value: string;
    label: string;
    badge?: number | string | null;
    content: ReactNode;
};

type MobileTabsProps = {
    items: MobileTabItem[];
    defaultValue?: string;
    className?: string;
};

export function MobileTabs({
    items,
    defaultValue,
    className,
}: MobileTabsProps) {
    const firstValue = items[0]?.value ?? '';
    const initialValue = defaultValue ?? firstValue;
    const [activeValue, setActiveValue] = useState(initialValue);
    const activeItem = useMemo(
        () => items.find((item) => item.value === activeValue) ?? items[0],
        [activeValue, items],
    );

    if (items.length === 0 || !activeItem) {
        return null;
    }

    return (
        <section className={cn('flex min-h-0 flex-col gap-3', className)}>
            <div className="overflow-x-auto py-1">
                <div className="mx-auto flex w-max max-w-full overflow-hidden rounded-lg border bg-card">
                    {items.map((item, index) => {
                        const active = item.value === activeItem.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveValue(item.value)}
                                className={cn(
                                    'min-h-10 min-w-24 px-4 text-sm font-medium whitespace-nowrap transition-colors',
                                    index > 0 && 'border-l',
                                    active
                                        ? 'bg-foreground text-background'
                                        : 'bg-card text-foreground hover:bg-muted',
                                )}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-0">{activeItem.content}</div>
        </section>
    );
}
