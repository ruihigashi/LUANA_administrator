import { createClient } from '@supabase/supabase-js';
export type Database = any;

// 環境変数から取得、フォールバック値も設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://opnrnjipuwjcxtvdnkdp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbnJuamlwdXdqY3h0dmRua2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzA5ODcsImV4cCI6MjA2MzUwNjk4N30.tOn6MgfxpfA3S14vdCaADmbBnoJ1rjUwNo-Z4ZYOX48';

// URLとキーの検証
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is required');
  throw new Error('VITE_SUPABASE_URL is required. Please check your environment variables.');
}

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY is required');
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your environment variables.');
}

console.log('Final Supabase URL:', supabaseUrl);
console.log('Final Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

// Supabaseクライアントの初期化をtry-catchで囲む
let supabase: ReturnType<typeof createClient<Database>>;
try {
  console.log('Initializing Supabase client...');
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw error;
}

export { supabase };
