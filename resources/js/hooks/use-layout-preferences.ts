import { useSyncExternalStore } from 'react';

export type ContentLayout = 'centered' | 'full-width';
export type NavbarStyle = 'sticky' | 'scroll';
export type SidebarVariant = 'inset' | 'sidebar' | 'floating';
export type SidebarCollapsible = 'icon' | 'offcanvas';

export type LayoutPreferences = {
    contentLayout: ContentLayout;
    navbarStyle: NavbarStyle;
    sidebarVariant: SidebarVariant;
    sidebarCollapsible: SidebarCollapsible;
};

const storageKey = 'layout-preferences';

export const defaultLayoutPreferences: LayoutPreferences = {
    contentLayout: 'full-width',
    navbarStyle: 'sticky',
    sidebarVariant: 'inset',
    sidebarCollapsible: 'icon',
};

let currentPreferences: LayoutPreferences = defaultLayoutPreferences;
const listeners = new Set<() => void>();

const isContentLayout = (value: unknown): value is ContentLayout =>
    value === 'centered' || value === 'full-width';

const isNavbarStyle = (value: unknown): value is NavbarStyle =>
    value === 'sticky' || value === 'scroll';

const isSidebarVariant = (value: unknown): value is SidebarVariant =>
    value === 'inset' || value === 'sidebar' || value === 'floating';

const isSidebarCollapsible = (value: unknown): value is SidebarCollapsible =>
    value === 'icon' || value === 'offcanvas';

function readPreferences(): LayoutPreferences {
    if (typeof window === 'undefined') {
        return defaultLayoutPreferences;
    }

    try {
        const stored = JSON.parse(
            localStorage.getItem(storageKey) ?? '{}',
        ) as Partial<LayoutPreferences>;

        return {
            contentLayout: isContentLayout(stored.contentLayout)
                ? stored.contentLayout
                : defaultLayoutPreferences.contentLayout,
            navbarStyle: isNavbarStyle(stored.navbarStyle)
                ? stored.navbarStyle
                : defaultLayoutPreferences.navbarStyle,
            sidebarVariant: isSidebarVariant(stored.sidebarVariant)
                ? stored.sidebarVariant
                : defaultLayoutPreferences.sidebarVariant,
            sidebarCollapsible: isSidebarCollapsible(stored.sidebarCollapsible)
                ? stored.sidebarCollapsible
                : defaultLayoutPreferences.sidebarCollapsible,
        };
    } catch {
        return defaultLayoutPreferences;
    }
}

function applyPreferences(preferences: LayoutPreferences): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.dataset.contentLayout = preferences.contentLayout;
    document.documentElement.dataset.navbarStyle = preferences.navbarStyle;
}

function notify(): void {
    listeners.forEach((listener) => listener());
}

function persistPreferences(preferences: LayoutPreferences): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
        // Las preferencias siguen funcionando durante esta sesión aunque el
        // navegador no permita persistirlas.
    }
}

function clearStoredPreferences(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(storageKey);
    } catch {
        // No hay una acción adicional necesaria si el almacenamiento falla.
    }
}

export function initializeLayoutPreferences(): void {
    currentPreferences = readPreferences();
    applyPreferences(currentPreferences);
}

export function useLayoutPreferences() {
    const preferences = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);

            return () => listeners.delete(listener);
        },
        () => currentPreferences,
        () => defaultLayoutPreferences,
    );

    const updatePreferences = (changes: Partial<LayoutPreferences>): void => {
        currentPreferences = { ...currentPreferences, ...changes };
        persistPreferences(currentPreferences);
        applyPreferences(currentPreferences);
        notify();
    };

    const resetPreferences = (): void => {
        currentPreferences = defaultLayoutPreferences;
        clearStoredPreferences();
        applyPreferences(currentPreferences);
        notify();
    };

    return { preferences, updatePreferences, resetPreferences } as const;
}
