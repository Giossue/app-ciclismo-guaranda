import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    /** 'slides': una imagen ancha a la vez. 'thumbnails': miniaturas cuadradas deslizables. */
    variant?: 'slides' | 'thumbnails';
    /** Alto/clases de cada diapositiva del modo 'slides'. */
    slideClassName?: string;
    /** Tamaño de cada miniatura cuadrada del modo 'thumbnails'. */
    thumbnailClassName?: string;
    className?: string;
    fallback?: ReactNode;
};

const thumbFallback = (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
        <ImageIcon className="size-8" />
    </div>
);

// Galería de imágenes con visor a pantalla completa. En modo 'thumbnails' las
// fotos se muestran como cuadrados en una fila deslizable (sin movimiento
// automático).
export default function ImageGallery({
    images,
    variant = 'slides',
    slideClassName = 'h-44 md:h-64',
    thumbnailClassName = 'h-44 w-44 md:h-52 md:w-52',
    className,
    fallback,
}: Props) {
    const stripRef = useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const count = images.length;
    const isOpen = lightboxIndex !== null;

    const handleScroll = () => {
        const element = stripRef.current;

        if (element && element.clientWidth > 0) {
            setActiveSlide(
                Math.round(element.scrollLeft / element.clientWidth),
            );
        }
    };

    const scrollToSlide = (index: number) => {
        const element = stripRef.current;

        if (!element) {
            return;
        }

        const clamped = Math.max(0, Math.min(index, count - 1));
        element.scrollTo({
            left: clamped * element.clientWidth,
            behavior: 'smooth',
        });
    };

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
            {variant === 'thumbnails' ? renderThumbnails() : renderSlides()}

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

    function renderThumbnail(image: GalleryImage, index: number) {
        return (
            <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                className={cn(
                    'relative shrink-0 overflow-hidden rounded-2xl border bg-muted/30',
                    thumbnailClassName,
                )}
                aria-label={`Ver imagen ${index + 1} de ${count}`}
            >
                <ImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    className="size-full object-cover"
                    fallback={thumbFallback}
                />
            </button>
        );
    }

    function renderThumbnails() {
        return (
            <div
                className={cn(
                    'flex [scrollbar-width:none] gap-3 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                    className,
                )}
            >
                {images.map((image, index) => (
                    <div key={`${image.src}-${index}`}>
                        {renderThumbnail(image, index)}
                    </div>
                ))}
            </div>
        );
    }

    function renderSlides() {
        return (
            <div className={cn('group relative', className)}>
                <div
                    ref={stripRef}
                    onScroll={handleScroll}
                    className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
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
                                fallback={thumbFallback}
                            />
                        </button>
                    ))}
                </div>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => scrollToSlide(activeSlide - 1)}
                            disabled={activeSlide === 0}
                            aria-label="Imagen anterior"
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSlide(activeSlide + 1)}
                            disabled={activeSlide === count - 1}
                            aria-label="Imagen siguiente"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white transition-opacity hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0"
                        >
                            <ChevronRight className="size-5" />
                        </button>

                        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                            {images.map((image, index) => (
                                <button
                                    key={`dot-${image.src}-${index}`}
                                    type="button"
                                    onClick={() => scrollToSlide(index)}
                                    aria-label={`Ir a la imagen ${index + 1}`}
                                    className={cn(
                                        'pointer-events-auto h-1.5 rounded-full transition-all',
                                        index === activeSlide
                                            ? 'w-4 bg-white'
                                            : 'w-1.5 bg-white/60 hover:bg-white/80',
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }
}
