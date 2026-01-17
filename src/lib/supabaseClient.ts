import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = "https://comgkdwwfewrzhccmtud.supabase.co"
const NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbWdrZHd3ZmV3cnpoY2NtdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTQwMzAsImV4cCI6MjA4NDE3MDAzMH0.mMESXf-OX2V-Xx3Sp7dhkw4ZYk_GelZdi6A8BlCaNuk"
export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
