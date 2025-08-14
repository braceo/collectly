import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const runtime = 'nodejs';

export async function GET(_req, { params }){
  const { data } = await supabaseAdmin.from('stores').select('*').eq('slug', params.slug).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
