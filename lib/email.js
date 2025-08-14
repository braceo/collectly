import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'collectly@example.com';
const MERCHANT = process.env.MERCHANT_EMAIL || 'owner@example.com';

export async function emailNewOrder({ itemTitle, email, pickupISO }){
  if (!process.env.RESEND_API_KEY) return;
  try { await resend.emails.send({ from: FROM, to: MERCHANT, subject: `New order: ${itemTitle}`, text: `Customer: ${email}. Pickup: ${pickupISO}.` }); } catch {}
}
export async function emailReady({ email, itemTitle, pickupISO, baseUrl }){
  if (!process.env.RESEND_API_KEY) return;
  try { await resend.emails.send({ from: FROM, to: email, subject: `Ready: ${itemTitle}`, text: `Pickup: ${pickupISO}. Store: ${baseUrl}` }); } catch {}
}
export async function emailCollected({ email, itemTitle }){
  if (!process.env.RESEND_API_KEY) return;
  try { await resend.emails.send({ from: FROM, to: email, subject: `Thanks — ${itemTitle}`, text: `Thanks for collecting.` }); } catch {}
}
