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

type NetworkStatusCallback = (status: ConnectionStatus) => void;

export function isNativeMobile(): boolean {
    return Capacitor.isNativePlatform();
}

export function hasNativePlugin(pluginName: string): boolean {
    return isNativeMobile() && Capacitor.isPluginAvailable(pluginName);
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
