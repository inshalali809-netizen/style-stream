-- Replace Stripe-specific columns with PSP-agnostic ones
alter table public.orders drop column if exists stripe_session_id;
alter table public.orders drop column if exists stripe_payment_intent;

alter table public.orders add column psp_name text;
alter table public.orders add column psp_reference text unique;

-- Add payment_method (how the customer chose to pay)
create type public.payment_method as enum ('easypaisa', 'raast', 'card', 'cod');

alter table public.orders add column payment_method public.payment_method not null default 'cod';

-- Switch default currency to PKR
alter table public.orders alter column currency set default 'pkr';

create index if not exists orders_psp_reference_idx on public.orders(psp_reference);
