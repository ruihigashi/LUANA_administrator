import { createClient } from '@supabase/supabase-js';
export type Database = any;

// 環境変数から取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URLとキーの検証
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is required');
  throw new Error('VITE_SUPABASE_URL is required. Please check your environment variables.');
}

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY is required');
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your environment variables.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
