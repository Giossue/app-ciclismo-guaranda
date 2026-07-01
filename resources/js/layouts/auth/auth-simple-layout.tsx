import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const safeTitle = title ?? '';
    const titleParts = safeTitle.split(' ').filter(Boolean);
    const titleLead = titleParts.slice(0, -1).join(' ') || safeTitle;
    const titleTail = titleParts.slice(-1)[0] ?? '';

    return (
        <main className="ueb-auth-shell">
            <section className="ueb-auth-hero">
                <Link href={home()} className="ueb-auth-logo">
                    <span className="ueb-auth-logo-mark">
                        <AppLogoIcon className="size-9" />
                    </span>
                    <span className="ueb-auth-logo-text">
                        Guaranda <span>Go</span>
                    </span>
                </Link>

                <MountainScene />

                <div className="ueb-auth-banner">
                    <h1>
                        {titleLead}{' '}
                        {titleTail ? <strong>{titleTail}</strong> : null}
                    </h1>
                    {description ? <p>{description}</p> : null}
                </div>
            </section>

            <section className="ueb-auth-card">{children}</section>
        </main>
    );
}

function MountainScene() {
    return (
        <svg
            className="ueb-auth-mountains"
            viewBox="0 0 430 200"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0 140L72 74L122 118L182 46L268 132L332 86L430 154V200H0V140Z"
                fill="rgb(178 240 0 / 0.11)"
            />
            <path
                d="M0 166L88 104L150 140L224 72L302 154L362 116L430 162V200H0V166Z"
                fill="rgb(178 240 0 / 0.16)"
            />
            <path
                d="M0 182L68 138L132 162L206 112L286 174L350 144L430 176V200H0V182Z"
                fill="rgb(178 240 0 / 0.24)"
            />
        </svg>
    );
}
