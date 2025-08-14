import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest, assertMember } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  await assertMember(user.id, storeId);

  const { data, error } = await supabaseAdmin
    .from('orders_with_titles')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function PUT(req) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data: before } = await supabaseAdmin
    .from('orders_with_titles')
    .select('*')
    .eq('id', body.id)
    .maybeSingle();

  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await assertMember(user.id, before.store_id);

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: body.status })
    .eq('id', body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // ⛔ Removed email sending

  return NextResponse.json({ ok: true });
}
