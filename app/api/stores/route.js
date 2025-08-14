import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
export const runtime = 'nodejs';

export async function POST(req){
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  const { data: store, error } = await supabaseAdmin.from('stores').insert({
    slug: body.slug, name: body.name || body.slug, created_by: user.id
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabaseAdmin.from('store_members').insert({ store_id: store.id, user_id: user.id, role: 'owner' });
  return NextResponse.json(store);
}
