import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest, assertMember } from '@/lib/auth';
export const runtime = 'nodejs';

export async function GET(req){
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  await assertMember(user.id, storeId);
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id,title,description,price_pennies,in_stock,image_urls,store_id')
    .eq('store_id', storeId)
    .order('created_at', { ascending:false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req){
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await assertMember(user.id, body.store_id);
  const { data, error } = await supabaseAdmin.from('products').insert({
    store_id: body.store_id,
    title: body.title,
    description: body.description || null,
    price_pennies: body.price_pennies,
    in_stock: true,
    image_urls: Array.isArray(body.image_urls) ? body.image_urls : []
  }).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0] || {});
}

export async function PUT(req){
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data: existing } = await supabaseAdmin.from('products').select('store_id').eq('id', body.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await assertMember(user.id, existing.store_id);

  const updates = {};
  if (typeof body.in_stock === 'boolean') updates.in_stock = body.in_stock;
  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price_pennies !== undefined) updates.price_pennies = body.price_pennies;
  if (Array.isArray(body.image_urls)) updates.image_urls = body.image_urls;

  const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', body.id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.[0] || {});
}
