import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  const sig = (await headers()).get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const pickupISO = s.metadata?.pickup_iso;
    const pickup_time = pickupISO
      ? new Date(pickupISO)
      : new Date(`${new Date().toISOString().split('T')[0]}T${s.metadata?.pickup_time || '12:00'}:00Z`);

    await supabaseAdmin.from('orders').insert({
      store_id: s.metadata?.store_id || null,
      product_id: s.metadata?.product_id || null,
      customer_email: s.metadata?.email || '',
      pickup_time,
      status: 'new',
      stripe_session_id: s.id,
    });
  }

  return NextResponse.json({ received: true });
}
