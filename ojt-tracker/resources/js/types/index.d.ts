export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone?: string;
    birthday?: string;
    company?: string;
    department?: string;
    position?: string;
    supervisor?: string;
    address?: string;
    required_hours: number;
}

export interface Attendance {
    id: number;
    user_id: number;
    date: string;
    am_time_in: string | null;
    am_time_out: string | null;
    am_total_hours: number | null;
    pm_time_in: string | null;
    pm_time_out: string | null;
    pm_total_hours: number | null;
    total_hours: number | null;
    status: 'present' | 'absent' | 'late';
    is_manual: boolean;
    created_at: string;
    updated_at: string;
}

export interface DiaryEntry {
    id: number;
    user_id: number;
    date: string;
    title: string;
    content: string | null;
    mood: 'happy' | 'neutral' | 'tired' | 'stressed' | 'productive';
    created_at: string;
    updated_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
