import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createSupabaseBrowserClient = () => {
  return createBrowserSupabaseClient()
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
