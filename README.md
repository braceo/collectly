# Collectly — Auth MVP (email/password) + multi-store

**What you get**
- Real login: merchants sign up/sign in with **email + password** (Supabase Auth).
- Each store has **members**. Only members can manage products, orders, uploads.
- Public storefront stays open at `/<store-slug>`.
- Upload is authenticated + rate-limited. Stripe Checkout + webhook included.
- Minimal, browser-only deployment steps in the earlier message still apply.

**How to use (browser)**
1) Deploy and set envs from `.env.example`.
2) Go to `/auth/signup` → create a user.
3) Go to `/merchant` → pick a **store slug** → **Create store** (you become owner).
4) Add products, toggle stock, process orders.
5) Invite a colleague by creating an account for them and adding them as a member (coming soon UI; for now insert into `store_members`).

> Honest note: This MVP enforces permissions server-side using the service role key and your JWT. We skip complex RLS for now to stay simple.
