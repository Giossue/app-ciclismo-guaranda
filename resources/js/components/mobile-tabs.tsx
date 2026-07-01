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
            <div className="sticky top-2 z-20 -mx-1 overflow-x-auto px-1 py-1 md:static md:z-auto">
                <div className="flex w-max max-w-full gap-1 rounded-2xl border bg-card/90 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75">
                    {items.map((item) => {
                        const active = item.value === activeItem.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setActiveValue(item.value)}
                                className={cn(
                                    'flex min-h-11 min-w-24 touch-manipulation items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-[background,color,transform] active:scale-[0.98]',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <span>{item.label}</span>
                                {item.badge ? (
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 py-0.5 text-[10px] leading-none font-black',
                                            active
                                                ? 'bg-primary-foreground/18 text-primary-foreground'
                                                : 'bg-muted text-muted-foreground',
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
