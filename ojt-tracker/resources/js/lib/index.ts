// Supabase Client & Helpers — barrel export
export { supabase } from './supabase';

// Auth helpers
export {
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    getSession,
    getUser,
    resetPassword,
    updatePassword,
    onAuthStateChange,
} from './supabase-auth';

// Storage helpers
export {
    uploadFile,
    getPublicUrl,
    getSignedUrl,
    listFiles,
    deleteFiles,
    moveFile,
} from './supabase-storage';

// Realtime helpers
export {
    subscribeToTable,
    subscribeToBroadcast,
    sendBroadcast,
    subscribeToPresence,
    unsubscribe,
} from './supabase-realtime';
