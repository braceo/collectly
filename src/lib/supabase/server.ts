import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from '@/types/supabase' // optional, if you use typed DB

export const createSupabaseServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

