import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req){
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const form = await req.formData();
  const productId = form.get('productId');
  const email = form.get('email');
  const pickup = form.get('pickup');
  const pickupISO = form.get('pickupISO');
  const storeId = form.get('storeId');

  const { data: p, error } = await supabaseAdmin.from('products').select('id,title,price_pennies,store_id').eq('id', productId).single();
  if (error || !p) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: String(email),
    line_items: [{ price_data: { currency: 'gbp', product_data: { name: p.title }, unit_amount: p.price_pennies }, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancelled`,
    metadata: { product_id: p.id, store_id: p.store_id || String(storeId||''), pickup_time: String(pickup), pickup_iso: String(pickupISO || ''), email: String(email) }
  });

  return NextResponse.redirect(session.url, 303);
}
