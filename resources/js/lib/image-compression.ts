// Compresión de imágenes en el cliente antes de subirlas.
// Objetivo: si una imagen supera el límite (por defecto 5 MB), reescalar y
// recomprimir con canvas hasta dejarla en el límite o menos, para que pueda
// subirse sin exceder validaciones ni límites de PHP/servidor.

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 2560;

// Solo reescribimos formatos raster que el canvas puede reencodear con calidad.
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type CompressImageOptions = {
    /** Tamaño máximo permitido en bytes. Por defecto 5 MB. */
    maxBytes?: number;
    /** Lado más largo máximo en píxeles tras reescalar. Por defecto 2560. */
    maxDimension?: number;
};

export function isCompressibleImage(file: File): boolean {
    return COMPRESSIBLE_TYPES.includes(file.type);
}

/**
 * Devuelve el archivo comprimido a <= maxBytes cuando es una imagen raster que
 * excede el límite. Para videos u otros formatos, o si algo falla, devuelve el
 * archivo original sin modificar.
 */
export async function compressImageToLimit(
    file: File,
    options: CompressImageOptions = {},
): Promise<File> {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

    if (!isCompressibleImage(file) || file.size <= maxBytes) {
        return file;
    }

    try {
        const loaded = await loadDrawableImage(file);

        try {
            const ratio = Math.min(
                1,
                maxDimension / Math.max(loaded.width, loaded.height),
            );
            let width = Math.max(1, Math.round(loaded.width * ratio));
            let height = Math.max(1, Math.round(loaded.height * ratio));
            let quality = 0.85;
            let blob = await drawToBlob(loaded.source, width, height, quality);

            let attempt = 0;

            while (blob.size > maxBytes && attempt < 10) {
                attempt++;

                if (quality > 0.5) {
                    quality = Math.max(0.5, quality - 0.1);
                } else {
                    width = Math.max(1, Math.round(width * 0.85));
                    height = Math.max(1, Math.round(height * 0.85));
                }

                blob = await drawToBlob(loaded.source, width, height, quality);
            }

            // Si por algún motivo quedó más grande que el original, conserva el original.
            if (blob.size >= file.size) {
                return file;
            }

            return new File([blob], toJpegName(file.name), {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } finally {
            loaded.cleanup();
        }
    } catch {
        return file;
    }
}

type DrawableImage = {
    source: CanvasImageSource;
    width: number;
    height: number;
    cleanup: () => void;
};

async function loadDrawableImage(file: File): Promise<DrawableImage> {
    if (typeof createImageBitmap === 'function') {
        try {
            const bitmap = await createImageBitmap(file, {
                imageOrientation: 'from-image',
            });

            return {
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                cleanup: () => bitmap.close(),
            };
        } catch {
            // Fallback a HTMLImageElement.
        }
    }

    const url = URL.createObjectURL(file);

    try {
        const image = await loadHtmlImage(url);

        return {
            source: image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            cleanup: () => URL.revokeObjectURL(url),
        };
    } catch (error) {
        URL.revokeObjectURL(url);

        throw error;
    }
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(new Error('No se pudo cargar la imagen para comprimir.'));
        image.src = url;
    });
}

async function drawToBlob(
    source: CanvasImageSource,
    width: number,
    height: number,
    quality: number,
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No hay soporte de canvas para comprimir imágenes.');
    }

    // Fondo blanco por si la imagen original tiene transparencia (PNG -> JPEG).
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);

                    return;
                }

                reject(new Error('No se pudo generar la imagen comprimida.'));
            },
            'image/jpeg',
            quality,
        );
    });
}

function toJpegName(name: string): string {
    const base = name.replace(/\.[^./\\]+$/u, '');

    return `${base || 'imagen'}.jpg`;
}
