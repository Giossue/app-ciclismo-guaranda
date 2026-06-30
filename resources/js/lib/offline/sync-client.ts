import SyncController from '@/actions/App/Http/Controllers/Cyclist/SyncController';
import {
    deleteQueueItem,
    pendingQueueItems,
    saveQueueItem,
} from './local-database';
import type { OfflineQueueItem } from './local-database';

type SyncResult = {
    client_id: string;
    event_type: string;
    status: 'enviado' | 'error';
    server_id?: number;
    error?: string;
};

type SyncResponse = {
    results: SyncResult[];
    server_time: string;
};

function csrfToken(): string | null {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? null
    );
}

export async function syncPendingOfflineEvents(): Promise<SyncResult[]> {
    const items = await pendingQueueItems();

    if (items.length === 0) {
        return [];
    }

    const response = await fetch(SyncController.store.url(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(csrfToken() ? { 'X-CSRF-TOKEN': csrfToken() as string } : {}),
        },
        body: JSON.stringify({
            events: items.map((item) => ({
                client_id: item.client_id,
                event_type: item.event_type,
                payload: item.payload,
            })),
        }),
    });

    if (!response.ok) {
        await markItemsAsFailed(items, `HTTP ${response.status}`);

        throw new Error('No se pudo sincronizar la cola offline.');
    }

    const data = (await response.json()) as SyncResponse;

    for (const result of data.results) {
        const item = items.find(
            (candidate) => candidate.client_id === result.client_id,
        );

        if (!item) {
            continue;
        }

        if (result.status === 'enviado') {
            await deleteQueueItem(result.client_id);
            continue;
        }

        await saveQueueItem({
            ...item,
            status: 'error',
            attempts: item.attempts + 1,
            last_error: result.error ?? 'Error de sincronización.',
            updated_at: new Date().toISOString(),
        });
    }

    return data.results;
}

async function markItemsAsFailed(
    items: OfflineQueueItem[],
    error: string,
): Promise<void> {
    await Promise.all(
        items.map((item) =>
            saveQueueItem({
                ...item,
                status: 'error',
                attempts: item.attempts + 1,
                last_error: error,
                updated_at: new Date().toISOString(),
            }),
        ),
    );
}
