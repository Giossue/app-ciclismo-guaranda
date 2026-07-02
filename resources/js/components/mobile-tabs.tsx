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
        <section className={cn('flex min-h-0 flex-col gap-4', className)}>
            <div className="sticky top-2 z-20 -mx-1 [scrollbar-width:none] overflow-x-auto px-1 py-1 [-ms-overflow-style:none] md:static md:z-auto [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-2">
                    {items.map((item) => {
                        const active = item.value === activeItem.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveValue(item.value)}
                                className={cn(
                                    'flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-bold whitespace-nowrap transition-[background,color,transform] active:scale-[0.98]',
                                    active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-[var(--tab-inactive-text)] hover:text-foreground',
                                )}
                            >
                                <span>{item.label}</span>
                                {item.badge ? (
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 py-0.5 text-[var(--fs-caption)] leading-none font-black',
                                            active
                                                ? 'bg-primary-foreground/18 text-primary-foreground'
                                                : 'bg-input text-muted-foreground',
                                        )}
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-0">{activeItem.content}</div>
        </section>
    );
}
