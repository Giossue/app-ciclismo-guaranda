import type { CyclingRouteMapItem } from '@/types';

const databaseName = 'guaranda-go-offline';
const databaseVersion = 1;
const routeStore = 'routes';
const queueStore = 'sync_queue';

type OfflineMapStatus = {
    status: string;
    description: string;
    estimated_size_mb: number | null;
};

export type OfflineRoutePackage = {
    server_time: string;
    route: CyclingRouteMapItem & {
        route_version: number;
    };
    download: OfflineRouteDownload | null;
    map: OfflineMapStatus;
};

export type OfflineRouteDownload = {
    id: number;
    route_id: number;
    route_version: number;
    current_route_version: number;
    is_outdated: boolean;
    download_status: string;
    size_mb: number | null;
    downloaded_at: string | null;
    local_deleted_at: string | null;
};

export type OfflineEventType =
    'offline_incident_reported' | 'offline_track_completed';

export type OfflineQueueItem = {
    client_id: string;
    event_type: OfflineEventType;
    payload: Record<string, unknown>;
    status: 'pendiente' | 'enviado' | 'error';
    attempts: number;
    last_error: string | null;
    created_at: string;
    updated_at: string;
};

export type OfflineRouteRecord = {
    slug: string;
    route_id: number;
    route_version: number;
    downloaded_at: string;
    package: OfflineRoutePackage;
};

function openOfflineDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(
                new Error('IndexedDB no está disponible en este dispositivo.'),
            );
        } else {
            const request = indexedDB.open(databaseName, databaseVersion);

            request.onerror = () =>
                reject(
                    request.error ??
                        new Error('No se pudo abrir la base offline.'),
                );
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(routeStore)) {
                    const store = db.createObjectStore(routeStore, {
                        keyPath: 'slug',
                    });
                    store.createIndex('route_id', 'route_id', {
                        unique: false,
                    });
                }

                if (!db.objectStoreNames.contains(queueStore)) {
                    const store = db.createObjectStore(queueStore, {
                        keyPath: 'client_id',
                    });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('event_type', 'event_type', {
                        unique: false,
                    });
                }
            };
        }
    });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onerror = () =>
            reject(request.error ?? new Error('Operación offline fallida.'));
        request.onsuccess = () => resolve(request.result);
    });
}

async function withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
    const db = await openOfflineDatabase();

    try {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const result = operation(store);

        return result instanceof IDBRequest
            ? await requestToPromise(result)
            : await result;
    } finally {
        db.close();
    }
}

function clientId(): string {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function saveOfflineRoute(
    pack: OfflineRoutePackage,
): Promise<OfflineRouteRecord> {
    const record: OfflineRouteRecord = {
        slug: pack.route.slug,
        route_id: pack.route.id,
        route_version: pack.route.route_version,
        downloaded_at: new Date().toISOString(),
        package: pack,
    };

    await withStore(routeStore, 'readwrite', (store) => store.put(record));

    return record;
}

export function getOfflineRoute(
    slug: string,
): Promise<OfflineRouteRecord | undefined> {
    return withStore<OfflineRouteRecord | undefined>(
        routeStore,
        'readonly',
        (store) => store.get(slug),
    );
}

export async function deleteOfflineRoute(slug: string): Promise<void> {
    await withStore(routeStore, 'readwrite', (store) => store.delete(slug));
}

export function listOfflineRoutes(): Promise<OfflineRouteRecord[]> {
    return withStore<OfflineRouteRecord[]>(routeStore, 'readonly', (store) =>
        store.getAll(),
    );
}

export async function enqueueOfflineEvent(
    eventType: OfflineEventType,
    payload: Record<string, unknown>,
): Promise<OfflineQueueItem> {
    const now = new Date().toISOString();
    const item: OfflineQueueItem = {
        client_id: clientId(),
        event_type: eventType,
        payload,
        status: 'pendiente',
        attempts: 0,
        last_error: null,
        created_at: now,
        updated_at: now,
    };

    await withStore(queueStore, 'readwrite', (store) => store.put(item));

    return item;
}

export function listQueueItems(): Promise<OfflineQueueItem[]> {
    return withStore<OfflineQueueItem[]>(queueStore, 'readonly', (store) =>
        store.getAll(),
    );
}

export async function pendingQueueItems(): Promise<OfflineQueueItem[]> {
    const items = await listQueueItems();

    return items.filter(
        (item) => item.status === 'pendiente' || item.status === 'error',
    );
}

export async function saveQueueItem(item: OfflineQueueItem): Promise<void> {
    await withStore(queueStore, 'readwrite', (store) => store.put(item));
}

export async function deleteQueueItem(clientId: string): Promise<void> {
    await withStore(queueStore, 'readwrite', (store) => store.delete(clientId));
}

export async function estimateOfflineStorage(): Promise<StorageEstimate | null> {
    if (!navigator.storage?.estimate) {
        return null;
    }

    return navigator.storage.estimate();
}
