// lib/supabase-server.js
import { createClient } from '@supabase/supabase-js'

// 🚨 Prevent accidental browser usage
if (typeof window !== 'undefined') {
  throw new Error('supabase-server.js was loaded in the browser! DO NOT DO THIS.')
}

// 🔐 Admin client — used only on the server
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)
