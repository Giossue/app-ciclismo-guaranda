import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance;

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (
        mode: Appearance,
        origin?: HTMLElement | null,
    ) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'light';

type ViewTransition = {
    ready: Promise<void>;
    finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
    startViewTransition?: (update: () => void) => ViewTransition;
};

type ViewTransitionAnimationOptions = KeyframeAnimationOptions & {
    pseudoElement: string;
};

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const storedAppearance = localStorage.getItem('appearance');

    if (storedAppearance === 'light' || storedAppearance === 'dark') {
        return storedAppearance;
    }

    // Migra una preferencia antigua "system" al tema actual una sola vez.
    return prefersDark() ? 'dark' : 'light';
};

const applyTheme = (appearance: Appearance, updateColorScheme = true): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = appearance === 'dark';

    document.documentElement.classList.toggle('dark', isDark);

    if (updateColorScheme) {
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentAppearance = getStoredAppearance();
    localStorage.setItem('appearance', currentAppearance);
    setCookie('appearance', currentAppearance);
    applyTheme(currentAppearance);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'light',
    );

    const updateAppearance = (
        mode: Appearance,
        origin?: HTMLElement | null,
    ): void => {
        if (mode === currentAppearance) {
            return;
        }

        const applyAppearance = (updateColorScheme = true): void => {
            currentAppearance = mode;
            localStorage.setItem('appearance', mode);
            setCookie('appearance', mode);
            applyTheme(mode, updateColorScheme);
            notify();
        };

        const transitionDocument = document as ViewTransitionDocument;
        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (
            !origin ||
            !transitionDocument.startViewTransition ||
            reduceMotion
        ) {
            applyAppearance();

            return;
        }

        const bounds = origin.getBoundingClientRect();
        const x = bounds.left + bounds.width / 2;
        const y = bounds.top + bounds.height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        );
        const root = document.documentElement;

        root.style.setProperty('--theme-transition-x', `${x}px`);
        root.style.setProperty('--theme-transition-y', `${y}px`);
        root.classList.add('theme-transitioning');

        let transition: ViewTransition;

        try {
            transition = transitionDocument.startViewTransition(() =>
                applyAppearance(false),
            );
        } catch {
            root.classList.remove('theme-transitioning');
            root.style.removeProperty('--theme-transition-x');
            root.style.removeProperty('--theme-transition-y');
            applyAppearance();

            return;
        }

        void transition.ready
            .then(() => {
                const revealAnimation = root.animate(
                    {
                        clipPath: [
                            `circle(1px at ${x}px ${y}px)`,
                            `circle(${radius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 1400,
                        easing: 'cubic-bezier(0.45, 0, 0.2, 1)',
                        fill: 'both',
                        pseudoElement: '::view-transition-new(root)',
                    } satisfies ViewTransitionAnimationOptions,
                );

                return revealAnimation.finished;
            })
            .catch(() => undefined);

        void transition.finished.finally(() => {
            root.style.colorScheme = mode;
            root.classList.remove('theme-transitioning');
            root.style.removeProperty('--theme-transition-x');
            root.style.removeProperty('--theme-transition-y');
        });
    };

    return {
        appearance,
        resolvedAppearance: appearance,
        updateAppearance,
    } as const;
}
