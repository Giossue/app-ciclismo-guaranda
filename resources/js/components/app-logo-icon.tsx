import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className = '',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.svg"
            alt="Guaranda Go"
            className={`rounded-full object-cover ${className}`}
            {...props}
        />
    );
}
