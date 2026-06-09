-- ============================================================
-- Molletiza — Schema SQL para Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- ─────────────────────────────────────────────
-- TABLA: profiles
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id        uuid references auth.users on delete cascade primary key,
  full_name text not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles_insert"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

create policy "profiles_update"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- ─────────────────────────────────────────────
-- TABLA: items (ingredientes)
-- ─────────────────────────────────────────────
create table if not exists public.items (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  status      text default 'available' not null
                check (status in ('available', 'assigned')),
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at  timestamptz default now() not null
);

alter table public.items enable row level security;

create policy "items_select"
  on public.items for select
  to authenticated using (true);

-- ─────────────────────────────────────────────
-- TABLA: dates (fechas para votar)
-- ─────────────────────────────────────────────
create table if not exists public.dates (
  id         uuid default gen_random_uuid() primary key,
  label      text not null,
  created_at timestamptz default now() not null
);

alter table public.dates enable row level security;

create policy "dates_select"
  on public.dates for select
  to authenticated using (true);

-- ─────────────────────────────────────────────
-- TABLA: votes (votos por fecha)
-- ─────────────────────────────────────────────
create table if not exists public.votes (
  id         uuid default gen_random_uuid() primary key,
  date_id    uuid references public.dates (id) on delete cascade not null,
  user_id    uuid references auth.users (id) on delete cascade not null,
  created_at timestamptz default now() not null,
  constraint votes_user_unique unique (user_id)
);

alter table public.votes enable row level security;

create policy "votes_select"
  on public.votes for select
  to authenticated using (true);

create policy "votes_insert"
  on public.votes for insert
  to authenticated with check (auth.uid() = user_id);

create policy "votes_update"
  on public.votes for update
  to authenticated using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TRIGGER: auto-crear perfil al registrarse
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- SEED: fechas del evento
-- ─────────────────────────────────────────────
insert into public.dates (label) values
  ('Viernes 12'),
  ('Viernes 19');

-- ─────────────────────────────────────────────
-- SEED: 26 ingredientes para la Molletiza
-- ─────────────────────────────────────────────
insert into public.items (name) values
  ('Bolillos (pan)'),
  ('Frijoles refritos'),
  ('Queso Oaxaca'),
  ('Queso manchego'),
  ('Jamón de pierna'),
  ('Chorizo'),
  ('Aguacate / Guacamole'),
  ('Jitomate'),
  ('Cebolla'),
  ('Chile jalapeño'),
  ('Mantequilla'),
  ('Crema ácida'),
  ('Salsa roja'),
  ('Salsa verde'),
  ('Limones'),
  ('Servilletas'),
  ('Vasos desechables'),
  ('Platos desechables'),
  ('Refresco (2L)'),
  ('Agua natural'),
  ('Cerveza (6-pack)'),
  ('Hielo (bolsa)'),
  ('Chile serrano'),
  ('Aceite de oliva'),
  ('Papel aluminio'),
  ('Tortillas de maíz');
