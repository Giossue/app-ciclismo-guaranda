import { FileVideo, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    compressImageToLimit,
    isCompressibleImage,
} from '@/lib/image-compression';
import { cn } from '@/lib/utils';

type PreviewItem = {
    id: string;
    file: File;
    url: string;
    isImage: boolean;
};

type Props = {
    id?: string;
    name: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMb?: number;
    required?: boolean;
    invalid?: boolean;
    className?: string;
    onProcessingChange?: (processing: boolean) => void;
};

export default function ImageFileInput({
    id,
    name,
    accept = 'image/*',
    multiple = false,
    maxFiles,
    maxSizeMb = 5,
    required = false,
    invalid = false,
    className,
    onProcessingChange,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const itemsRef = useRef<PreviewItem[]>([]);
    const [items, setItems] = useState<PreviewItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const limit = maxFiles ?? (multiple ? 8 : 1);
    const maxBytes = Math.round(maxSizeMb * 1024 * 1024);

    const writeToInput = useCallback((next: PreviewItem[]) => {
        const input = inputRef.current;

        if (!input) {
            return;
        }

        const transfer = new DataTransfer();
        next.forEach((item) => transfer.items.add(item.file));
        input.files = transfer.files;
    }, []);

    const applyItems = useCallback(
        (next: PreviewItem[]) => {
            const previous = itemsRef.current;
            previous.forEach((item) => {
                if (!next.some((candidate) => candidate.id === item.id)) {
                    URL.revokeObjectURL(item.url);
                }
            });

            itemsRef.current = next;
            setItems(next);
            writeToInput(next);
        },
        [writeToInput],
    );

    const handleChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const picked = Array.from(event.target.files ?? []);

            if (picked.length === 0) {
                return;
            }

            setProcessing(true);
            onProcessingChange?.(true);

            try {
                const processed = await Promise.all(
                    picked.map(async (file) =>
                        isCompressibleImage(file)
                            ? await compressImageToLimit(file, { maxBytes })
                            : file,
                    ),
                );

                const base = multiple ? itemsRef.current : [];
                const merged = [...base];

                for (const file of processed) {
                    const duplicate = merged.some(
                        (item) =>
                            item.file.name === file.name &&
                            item.file.size === file.size,
                    );

                    if (duplicate) {
                        continue;
                    }

                    merged.push({
                        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
                        file,
                        url: URL.createObjectURL(file),
                        isImage: file.type.startsWith('image/'),
                    });
                }

                applyItems(merged.slice(0, limit));
            } finally {
                setProcessing(false);
                onProcessingChange?.(false);
            }
        },
        [applyItems, limit, maxBytes, multiple, onProcessingChange],
    );

    const removeItem = useCallback(
        (itemId: string) => {
            applyItems(itemsRef.current.filter((item) => item.id !== itemId));
        },
        [applyItems],
    );

    useEffect(() => {
        return () => {
            itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, []);

    return (
        <div className={cn('grid gap-3', className)}>
            <Input
                ref={inputRef}
                id={inputId}
                name={name}
                type="file"
                accept={accept}
                multiple={multiple}
                required={required && items.length === 0}
                disabled={processing}
                onChange={handleChange}
                aria-invalid={invalid}
            />

            {processing && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Optimizando imágenes para que no superen {maxSizeMb} MB...
                </p>
            )}

            {items.length > 0 && (
                <div className="flex gap-3 overflow-x-auto rounded-2xl border bg-muted/20 p-3">
                    {items.map((item) => (
                        <figure
                            key={item.id}
                            className="relative min-w-36 overflow-hidden rounded-2xl border bg-card"
                        >
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
                                aria-label={`Quitar ${item.file.name}`}
                            >
                                <X className="size-3.5" />
                            </button>

                            {item.isImage ? (
                                <img
                                    src={item.url}
                                    alt={item.file.name}
                                    className="h-24 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-full items-center justify-center bg-muted/40 text-muted-foreground">
                                    <FileVideo className="size-8" />
                                </div>
                            )}

                            <figcaption className="grid gap-0.5 p-2">
                                <span className="truncate text-xs text-muted-foreground">
                                    {item.file.name}
                                </span>
                                <span className="text-[var(--fs-caption)] font-semibold text-muted-foreground">
                                    {formatBytes(item.file.size)}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
