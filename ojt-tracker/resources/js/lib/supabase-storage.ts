import { supabase } from './supabase';

const DEFAULT_BUCKET = 'uploads';

// ─── Upload File ────────────────────────────────────────────
export async function uploadFile(
    file: File,
    path: string,
    bucket: string = DEFAULT_BUCKET
) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });
    return { data, error };
}

// ─── Download / Get Public URL ──────────────────────────────
export function getPublicUrl(path: string, bucket: string = DEFAULT_BUCKET) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

// ─── Create Signed URL (temporary access) ───────────────────
export async function getSignedUrl(
    path: string,
    expiresInSeconds: number = 3600,
    bucket: string = DEFAULT_BUCKET
) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);
    return { data, error };
}

// ─── List Files in a Folder ────────────────────────────────
export async function listFiles(folder: string = '', bucket: string = DEFAULT_BUCKET) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
    });
    return { data, error };
}

// ─── Delete File(s) ────────────────────────────────────────
export async function deleteFiles(paths: string[], bucket: string = DEFAULT_BUCKET) {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
}

// ─── Move / Rename File ────────────────────────────────────
export async function moveFile(
    fromPath: string,
    toPath: string,
    bucket: string = DEFAULT_BUCKET
) {
    const { data, error } = await supabase.storage.from(bucket).move(fromPath, toPath);
    return { data, error };
}
