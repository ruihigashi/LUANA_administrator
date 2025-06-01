import { createClient } from '@supabase/supabase-js';
export type Database = any;


const supabaseUrl = 'https://opnrnjipuwjcxtvdnkdp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbnJuamlwdXdqY3h0dmRua2RwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzMDk4NywiZXhwIjoyMDYzNTA2OTg3fQ.2k2Asip007ZBWcN13r2lJnbEIbhWmTr9D3IaPpvl-xY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);