import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import ImageWithFallback from '@/components/image-with-fallback';
import { cn } from '@/lib/utils';

export type GalleryImage = {
    src: string;
    alt: string;
    description?: string | null;
};

type Props = {
    images: GalleryImage[];
    /** Alto/clases de cada diapositiva de la tira horizontal. */
    slideClassName?: string;
    className?: string;
    fallback?: ReactNode;
};

// Muestra varias imágenes en una tira horizontal con deslizamiento y, al tocar
// una, abre un visor a pantalla completa que muestra la imagen completa y
// permite navegar entre todas.
export default function ImageGallery({
    images,
    slideClassName = 'h-44 md:h-64',
    className,
    fallback,
}: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const count = images.length;
    const isOpen = lightboxIndex !== null;

    const go = useCallback(
        (direction: number) => {
            setLightboxIndex((current) =>
                current === null
                    ? current
                    : (current + direction + count) % count,
            );
        },
        [count],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLightboxIndex(null);
            } else if (event.key === 'ArrowRight') {
                go(1);
            } else if (event.key === 'ArrowLeft') {
                go(-1);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen, go]);

    if (count === 0) {
        return <>{fallback}</>;
    }

    const active = lightboxIndex === null ? null : images[lightboxIndex];

    return (
        <>
            <div className={cn('relative', className)}>
                <div className="flex snap-x snap-mandatory [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((image, index) => (
                        <button
                            key={`${image.src}-${index}`}
                            type="button"
                            onClick={() => setLightboxIndex(index)}
                            className={cn(
                                'relative w-full shrink-0 snap-center overflow-hidden',
                                slideClassName,
                            )}
                            aria-label={`Ver imagen ${index + 1} de ${count}`}
                        >
                            <ImageWithFallback
                                src={image.src}
                                alt={image.alt}
                                className="size-full object-cover"
                                fallback={
                                    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                                        <ImageIcon className="size-8" />
                                    </div>
                                }
                            />
                        </button>
                    ))}
                </div>

                {count > 1 && (
                    <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                        {count} fotos · toca para ampliar
                    </span>
                )}
            </div>

            {isOpen && active && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col bg-black/95"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div className="flex items-center justify-between p-4 text-white">
                        <span className="text-sm font-semibold">
                            {(lightboxIndex ?? 0) + 1} / {count}
                        </span>
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(null)}
                            aria-label="Cerrar"
                            className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div
                        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={active.src}
                            alt={active.alt}
                            className="max-h-full max-w-full object-contain"
                        />

                        {count > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => go(-1)}
                                    aria-label="Imagen anterior"
                                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                >
                                    <ChevronLeft className="size-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => go(1)}
                                    aria-label="Imagen siguiente"
                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {active.description && (
                        <p
                            className="px-4 pb-6 text-center text-sm text-white/80"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {active.description}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
