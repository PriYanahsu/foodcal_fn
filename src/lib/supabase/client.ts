'use client';

import { createBrowserClient } from "@supabase/ssr";

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
    if (supabaseInstance) return supabaseInstance;

    supabaseInstance = createBrowserClient(
        'https://comgkdwwfewrzhccmtud.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbWdrZHd3ZmV3cnpoY2NtdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTQwMzAsImV4cCI6MjA4NDE3MDAzMH0.mMESXf-OX2V-Xx3Sp7dhkw4ZYk_GelZdi6A8BlCaNuk'
    );

    return supabaseInstance;
};
