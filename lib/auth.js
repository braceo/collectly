import { supabaseAdmin } from '@/lib/supabase';

export async function getUserFromRequest(req){
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    return user || null;
  } catch { return null; }
}

export async function assertMember(userId, storeId){
  const { data } = await supabaseAdmin
    .from('store_members')
    .select('store_id')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) {
    const e = new Error('Forbidden');
    e.status = 403; throw e;
  }
}
