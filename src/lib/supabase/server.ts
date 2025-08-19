import { type Database } from '@/types/supabase'

export const createSupabaseServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
