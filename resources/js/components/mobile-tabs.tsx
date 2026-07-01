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
            <div className="-mx-4 overflow-x-auto border-y bg-card px-4 py-2 md:mx-0 md:rounded-lg md:border">
                <div className="flex w-max min-w-full gap-2">
                    {items.map((item) => {
                        const active = item.value === activeItem.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveValue(item.value)}
                                className={cn(
                                    'flex min-h-10 items-center justify-center gap-1 rounded-md border px-3 text-sm font-semibold whitespace-nowrap transition-colors',
                                    active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                {item.label}
                                {item.badge !== null &&
                                    item.badge !== undefined && (
                                        <span
                                            className={cn(
                                                'rounded-sm px-1.5 py-0.5 text-[10px]',
                                                active
                                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                                    : 'bg-card text-foreground',
                                            )}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-0">{activeItem.content}</div>
        </section>
    );
}
