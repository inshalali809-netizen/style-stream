-- Products table
create table public.products (
  id             text primary key,
  name           text not null,
  price          integer not null check (price > 0),
  image_url      text,
  category       text not null,
  color          text not null,
  description    text not null,
  bestseller     boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (active = true);

grant select on public.products to anon, authenticated;
grant select, insert, update, delete on public.products to service_role;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

insert into public.products (id, name, price, category, color, description, bestseller) values
  ('lin-blazer',    'Linen Atelier Blazer',   289, 'Outerwear', 'Cream', 'Unstructured linen blazer with peak lapels.',      true),
  ('wide-trouser',  'Wide-Leg Trouser 02',     178, 'Bottoms',   'Sand',  'High-rise pleated trouser, fluid drape.',           true),
  ('core-tee',      'Heavyweight Core Tee',     64, 'Tops',      'White', '12oz combed cotton, boxy oversized fit.',           true),
  ('camel-coat',    'Camel Long Coat',          489, 'Outerwear', 'Camel', 'Pure wool double-breasted coat.',                  true),
  ('silk-slip',     'Silk Bias Slip Dress',     224, 'Dresses',   'Black', '100% silk charmeuse, midi length.',                false),
  ('ribbed-knit',   'Ribbed Cashmere Knit',     198, 'Tops',      'Cream', 'Soft rib cashmere blend, relaxed cut.',            false),
  ('cargo-pant',    'Field Cargo Pant',         158, 'Bottoms',   'Olive', 'Heavy twill utility pant, drawcord hem.',          false),
  ('rust-midi',     'Rust Midi Dress',          184, 'Dresses',   'Rust',  'Smocked waist, silk-touch viscose.',               false);
