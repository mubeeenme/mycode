import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock client.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://mock.supabase.co',
  supabaseAnonKey || 'mock_key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export type SupabaseClient = typeof supabase;