import { createClient } from '@supabase/supabase-js';

if (typeof window === 'undefined') {
  console.log('🛠 SERVER SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('🛠 SERVER SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
}


// ✅ Server-side env vars (Vercel build logs only, not browser)
console.log('SUPABASE URL (top-level):', process.env.SUPABASE_URL);
console.log('SUPABASE SERVICE ROLE KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔐 Server-only admin client (DO NOT expose in browser)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// 🌐 Client-side browser client
export function createBrowserClient() {
  // ✅ Logs show up in the browser console
  console.log('SUPABASE URL (inside function):', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE ANON KEY (inside function):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true } }
  );
}
