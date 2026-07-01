export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header
            className={
                variant === 'small'
                    ? 'flex flex-col gap-1.5'
                    : 'flex flex-col gap-2'
            }
        >
            <h2
                className={
                    variant === 'small'
                        ? 'font-display text-lg leading-tight font-extrabold tracking-[-0.02em] text-foreground'
                        : 'font-display text-2xl leading-tight font-black tracking-[-0.035em] text-foreground sm:text-3xl'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </header>
    );
}
