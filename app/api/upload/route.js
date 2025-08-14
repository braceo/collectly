import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest, assertMember } from '@/lib/auth';
export const runtime = 'nodejs';

export async function POST(req){
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  const storeId = form.get('storeId');
  if (!file || !file.arrayBuffer) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!storeId) return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
  await assertMember(user.id, storeId);

  // Rate limit: per IP per hour
  const forw = req.headers.get('x-forwarded-for') || '';
  const ip = forw.split(',')[0].trim() || 'unknown';
  const sinceISO = new Date(Date.now() - 60*60*1000).toISOString();
  const { count } = await supabaseAdmin
    .from('upload_logs').select('*', { count: 'exact', head: true })
    .gte('created_at', sinceISO).eq('ip', ip).eq('store_id', storeId);
  if ((count || 0) >= 50) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const arrayBuffer = await file.arrayBuffer();
  const yyyymm = new Date().toISOString().slice(0,7);
  const path = `products/${yyyymm}/${crypto.randomUUID()}.webp`;

  const { error } = await supabaseAdmin
    .storage.from('product-images')
    .upload(path, Buffer.from(arrayBuffer), { contentType: 'image/webp', upsert: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from('upload_logs').insert({ ip, store_id: storeId, user_id: user.id });

  const { data: pub } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
