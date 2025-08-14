create extension if not exists pgcrypto;

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text,
  created_by uuid not null, -- auth.users.id (string)
  created_at timestamptz not null default now()
);

create table if not exists store_members (
  store_id uuid not null references stores(id) on delete cascade,
  user_id uuid not null, -- auth.users.id (string)
  role text not null default 'owner', -- owner | manager
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  title text not null,
  description text,
  price_pennies integer not null check (price_pennies >= 0),
  in_stock boolean not null default true,
  image_urls jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  customer_email text not null,
  pickup_time timestamptz not null,
  status text not null default 'new', -- new | ready | collected
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create or replace view orders_with_titles as
select o.*, p.title as item_title
from orders o
left join products p on p.id = o.product_id;

create table if not exists upload_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  user_id uuid,
  ip text,
  created_at timestamptz not null default now()
);
