import { supabase } from './supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// ─── Subscribe to Table Changes ────────────────────────────
export function subscribeToTable<T extends Record<string, unknown>>(
    table: string,
    event: PostgresEvent,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void,
    filter?: string
): RealtimeChannel {
    const channelConfig: {
        event: PostgresEvent;
        schema: string;
        table: string;
        filter?: string;
    } = {
        event,
        schema: 'public',
        table,
    };

    if (filter) {
        channelConfig.filter = filter;
    }

    const channel = supabase
        .channel(`${table}-changes`)
        .on(
            'postgres_changes' as any,
            channelConfig,
            (payload: RealtimePostgresChangesPayload<T>) => {
                callback(payload);
            }
        )
        .subscribe();

    return channel;
}

// ─── Subscribe to Broadcast Messages ───────────────────────
export function subscribeToBroadcast(
    channelName: string,
    eventName: string,
    callback: (payload: { event: string; payload: unknown }) => void
): RealtimeChannel {
    const channel = supabase
        .channel(channelName)
        .on('broadcast', { event: eventName }, callback)
        .subscribe();

    return channel;
}

// ─── Send Broadcast Message ────────────────────────────────
export async function sendBroadcast(
    channelName: string,
    eventName: string,
    payload: Record<string, unknown>
) {
    const channel = supabase.channel(channelName);
    await channel.send({
        type: 'broadcast',
        event: eventName,
        payload,
    });
    return channel;
}

// ─── Subscribe to Presence ─────────────────────────────────
export function subscribeToPresence(
    channelName: string,
    callbacks: {
        onSync?: () => void;
        onJoin?: (key: string, currentPresences: unknown, newPresences: unknown) => void;
        onLeave?: (key: string, currentPresences: unknown, leftPresences: unknown) => void;
    }
): RealtimeChannel {
    const channel = supabase.channel(channelName);

    if (callbacks.onSync) {
        channel.on('presence', { event: 'sync' }, callbacks.onSync);
    }
    if (callbacks.onJoin) {
        channel.on('presence', { event: 'join' }, ({ key, currentPresences, newPresences }) => {
            callbacks.onJoin!(key, currentPresences, newPresences);
        });
    }
    if (callbacks.onLeave) {
        channel.on('presence', { event: 'leave' }, ({ key, currentPresences, leftPresences }) => {
            callbacks.onLeave!(key, currentPresences, leftPresences);
        });
    }

    channel.subscribe();
    return channel;
}

// ─── Unsubscribe from a Channel ────────────────────────────
export async function unsubscribe(channel: RealtimeChannel) {
    await supabase.removeChannel(channel);
}
