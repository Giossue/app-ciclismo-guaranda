import { useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
    src: string;
    alt: string;
    className?: string;
    fallback: ReactNode;
};

// Renderiza una imagen y, si el archivo no existe o falla la carga, muestra un
// contenido de respaldo en vez del ícono de "imagen rota" del navegador.
export default function ImageWithFallback({
    src,
    alt,
    className,
    fallback,
}: Props) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    // Se considera fallida solo si el src que falló es el que se pide ahora;
    // así, al cambiar el src, se vuelve a intentar sin necesidad de un effect.
    const failed = failedSrc === src;

    if (!src || failed) {
        return <>{fallback}</>;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setFailedSrc(src)}
        />
    );
}
