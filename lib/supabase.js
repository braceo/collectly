import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE URL (top-level):', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE ANON KEY (top-level):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export function createBrowserClient() {
  console.log('SUPABASE URL (inside function):', process.env.NEXT_PUBLIC_SUPABASE_URL);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}
