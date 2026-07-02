import { App as CapacitorApp } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import type { ConnectionStatus } from '@capacitor/network';
import { router } from '@inertiajs/react';

export type AppPosition = {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
    };
    timestamp: number;
};

export type AppLocationSnapshot = {
    latitude: number;
    longitude: number;
    accuracyM: number | null;
    recordedAt: string;
};

type NetworkStatusCallback = (status: ConnectionStatus) => void;

const rememberedLocationKey = 'guaranda-go:last-location';
const rememberedLocationMaxAgeMs = 15 * 60 * 1000;

export function isNativeMobile(): boolean {
    return Capacitor.isNativePlatform();
}

export function hasNativePlugin(pluginName: string): boolean {
    return isNativeMobile() && Capacitor.isPluginAvailable(pluginName);
}

export function setupNativeBackButton(): void {
    if (!hasNativePlugin('App')) {
        return;
    }

    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack && window.history.length > 1) {
            window.history.back();

            return;
        }

        const fallbackPath = window.location.pathname.startsWith('/admin')
            ? '/admin/dashboard'
            : '/routes';

        if (window.location.pathname !== fallbackPath) {
            router.visit(fallbackPath, {
                replace: true,
                preserveScroll: false,
                preserveState: false,
            });

            return;
        }

        void CapacitorApp.exitApp();
    });
}

export function browserNetworkStatus(): ConnectionStatus {
    return {
        connected: typeof navigator === 'undefined' ? true : navigator.onLine,
        connectionType: 'unknown',
    };
}

export async function getNetworkStatus(): Promise<ConnectionStatus> {
    if (hasNativePlugin('Network')) {
        return Network.getStatus();
    }

    return browserNetworkStatus();
}

export function watchNetworkStatus(
    callback: NetworkStatusCallback,
): () => void {
    if (hasNativePlugin('Network')) {
        let active = true;
        let handle: PluginListenerHandle | null = null;

        void Network.addListener('networkStatusChange', callback).then(
            (listener) => {
                if (active) {
                    handle = listener;

                    return;
                }

                void listener.remove();
            },
        );

        return () => {
            active = false;
            void handle?.remove();
        };
    }

    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const notify = () => callback(browserNetworkStatus());

    window.addEventListener('online', notify);
    window.addEventListener('offline', notify);

    return () => {
        window.removeEventListener('online', notify);
        window.removeEventListener('offline', notify);
    };
}

export async function getCurrentNativePosition(): Promise<Position> {
    return Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
    });
}

export async function getCurrentAppPosition(): Promise<AppPosition> {
    if (hasNativePlugin('Geolocation')) {
        try {
            await Geolocation.requestPermissions({ permissions: ['location'] });
        } catch {
            // getCurrentPosition will surface the permission/location error.
        }

        return getCurrentNativePosition();
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        throw new Error('Geolocation unavailable');
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    },
                    timestamp: position.timestamp,
                });
            },
            reject,
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
        );
    });
}

export async function getCurrentAppLocation(): Promise<AppLocationSnapshot> {
    return rememberAppPosition(await getCurrentAppPosition());
}

export function rememberAppPosition(
    position: AppPosition,
): AppLocationSnapshot {
    const snapshot: AppLocationSnapshot = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyM: position.coords.accuracy,
        recordedAt: new Date(position.timestamp).toISOString(),
    };

    if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
            rememberedLocationKey,
            JSON.stringify(snapshot),
        );
    }

    return snapshot;
}

export function getRememberedAppLocation(
    maxAgeMs = rememberedLocationMaxAgeMs,
): AppLocationSnapshot | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.sessionStorage.getItem(rememberedLocationKey);

    if (!raw) {
        return null;
    }

    try {
        const snapshot = JSON.parse(raw) as Partial<AppLocationSnapshot>;
        const recordedAt = snapshot.recordedAt
            ? Date.parse(snapshot.recordedAt)
            : Number.NaN;

        if (
            typeof snapshot.latitude !== 'number' ||
            typeof snapshot.longitude !== 'number' ||
            !Number.isFinite(recordedAt) ||
            Date.now() - recordedAt > maxAgeMs
        ) {
            window.sessionStorage.removeItem(rememberedLocationKey);

            return null;
        }

        return {
            latitude: snapshot.latitude,
            longitude: snapshot.longitude,
            accuracyM:
                typeof snapshot.accuracyM === 'number'
                    ? snapshot.accuracyM
                    : null,
            recordedAt:
                snapshot.recordedAt ?? new Date(recordedAt).toISOString(),
        };
    } catch {
        window.sessionStorage.removeItem(rememberedLocationKey);

        return null;
    }
}

export async function takeIncidentPhoto(): Promise<Photo> {
    return Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri,
        quality: 82,
        correctOrientation: true,
    });
}

export async function ensureOfflineDataDirectory(): Promise<void> {
    if (!hasNativePlugin('Filesystem')) {
        return;
    }

    try {
        await Filesystem.mkdir({
            path: 'offline',
            directory: Directory.Data,
            recursive: true,
        });
    } catch {
        // Directory may already exist. The caller only needs best-effort readiness.
    }
}

export async function writeOfflineJson(
    path: string,
    data: unknown,
): Promise<void> {
    if (!hasNativePlugin('Filesystem')) {
        return;
    }

    await ensureOfflineDataDirectory();
    await Filesystem.writeFile({
        path: `offline/${path}`,
        directory: Directory.Data,
        data: JSON.stringify(data),
        encoding: Encoding.UTF8,
        recursive: true,
    });
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
    if (!hasNativePlugin('LocalNotifications')) {
        return false;
    }

    const current = await LocalNotifications.checkPermissions();

    if (current.display === 'granted') {
        return true;
    }

    const requested = await LocalNotifications.requestPermissions();

    return requested.display === 'granted';
}
