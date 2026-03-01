import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ─── Sign Up ────────────────────────────────────────────────
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
}

// ─── Sign In with Email / Password ─────────────────────────
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

// ─── Sign In with OAuth (Google, GitHub, etc.) ──────────────
export async function signInWithOAuth(provider: 'google' | 'github' | 'gitlab' | 'bitbucket') {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    return { data, error };
}

// ─── Sign Out ───────────────────────────────────────────────
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// ─── Get Current Session ────────────────────────────────────
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
}

// ─── Get Current User ───────────────────────────────────────
export async function getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
}

// ─── Password Reset ────────────────────────────────────────
export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
}

// ─── Update Password ───────────────────────────────────────
export async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
}

// ─── Auth State Listener ───────────────────────────────────
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
}
