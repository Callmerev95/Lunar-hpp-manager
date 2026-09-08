-- 0001_init.sql
-- HPP Manager schema + RLS

create extension if not exists "pgcrypto" with schema extensions;

create type public.material_kind as enum ('raw', 'packaging');

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind public.material_kind not null,
  buy_unit text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.material_prices (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  price numeric(14,2) not null check (price >= 0),
  qty numeric(12,2) not null default 1 check (qty > 0),
  unit text not null,
  effective_at timestamptz not null default now(),
  notes text
);

create index material_prices_material_id_idx on public.material_prices (material_id);
create index material_prices_material_effective_idx
  on public.material_prices (material_id, effective_at desc);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  output_qty numeric(12,2) not null check (output_qty > 0),
  output_unit text not null,
  margin_pct numeric(5,2) not null default 30 check (margin_pct >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_materials (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete restrict,
  qty numeric(12,2) not null check (qty > 0),
  unit text not null,
  sort_order integer not null default 0
);

create index recipe_materials_recipe_id_idx on public.recipe_materials (recipe_id);

-- utilities
-- trigram search on material/recipe name
create extension if not exists pg_trgm with schema extensions;

create index materials_name_trgm_idx on public.materials using gin (name gin_trgm_ops);
create index recipes_name_trgm_idx on public.recipes using gin (name gin_trgm_ops);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_materials ENABLE ROW LEVEL SECURITY;

create function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger materials_set_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create policy "Materials owned" on public.materials
  for select to authenticated
  using (user_id = auth.uid());
create policy "Materials insert own" on public.materials
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "Materials update own" on public.materials
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "Materials delete own" on public.materials
  for delete to authenticated
  using (user_id = auth.uid());

create policy "Prices view own" on public.material_prices
  for select to authenticated
  using (material_id in (
    select id from public.materials where user_id = auth.uid()
  ));
create policy "Prices insert own" on public.material_prices
  for insert to authenticated
  with check (material_id in (
    select id from public.materials where user_id = auth.uid()
  ));
create policy "Prices update own" on public.material_prices
  for update to authenticated
  using (material_id in (
    select id from public.materials where user_id = auth.uid()
  ))
  with check (material_id in (
    select id from public.materials where user_id = auth.uid()
  ));
create policy "Prices delete own" on public.material_prices
  for delete to authenticated
  using (material_id in (
    select id from public.materials where user_id = auth.uid()
  ));

create policy "Recipes owned" on public.recipes
  for select to authenticated
  using (user_id = auth.uid());
create policy "Recipes insert own" on public.recipes
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "Recipes update own" on public.recipes
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "Recipes delete own" on public.recipes
  for delete to authenticated
  using (user_id = auth.uid());

create policy "Recipe materials view own" on public.recipe_materials
  for select to authenticated
  using (recipe_id in (
    select id from public.recipes where user_id = auth.uid()
  ));
create policy "Recipe materials insert own" on public.recipe_materials
  for insert to authenticated
  with check (recipe_id in (
    select id from public.recipes where user_id = auth.uid()
  ) and material_id in (
    select id from public.materials where user_id = auth.uid()
  ));
create policy "Recipe materials update own" on public.recipe_materials
  for update to authenticated
  using (recipe_id in (
    select id from public.recipes where user_id = auth.uid()
  ))
  with check (recipe_id in (
    select id from public.recipes where user_id = auth.uid()
  ) and material_id in (
    select id from public.materials where user_id = auth.uid()
  ));
create policy "Recipe materials delete own" on public.recipe_materials
  for delete to authenticated
  using (recipe_id in (
    select id from public.recipes where user_id = auth.uid()
  ));