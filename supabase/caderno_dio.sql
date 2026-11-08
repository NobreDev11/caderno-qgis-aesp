-- Caderno da trilha DIO: dados pessoais, no Supabase do Checklist (mesmo login do caderno QGIS).
-- Cada usuário só lê e grava as próprias linhas, e precisa ser admin (is_admin()).
-- Não altera nenhuma tabela existente (nem a caderno_notas do QGIS). Pode rodar mais de uma vez.
-- PDFs e fotos usam a pasta privada "caderno" do Storage, criada por supabase/caderno_notas.sql
-- (arquivos da DIO ficam em <user_id>/dio-...). Se esse SQL nunca foi rodado, rode-o antes.

create table if not exists public.caderno_dio (
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  id         text   not null check (char_length(id) between 1 and 80),
  body       jsonb  not null,
  upd        bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.caderno_dio enable row level security;
revoke all on public.caderno_dio from anon;
grant select, insert, update, delete on public.caderno_dio to authenticated;

drop policy if exists caderno_dio_select on public.caderno_dio;
drop policy if exists caderno_dio_insert on public.caderno_dio;
drop policy if exists caderno_dio_update on public.caderno_dio;
drop policy if exists caderno_dio_delete on public.caderno_dio;

create policy caderno_dio_select on public.caderno_dio
  for select to authenticated using (user_id = auth.uid() and public.is_admin());
create policy caderno_dio_insert on public.caderno_dio
  for insert to authenticated with check (user_id = auth.uid() and public.is_admin());
create policy caderno_dio_update on public.caderno_dio
  for update to authenticated using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());
create policy caderno_dio_delete on public.caderno_dio
  for delete to authenticated using (user_id = auth.uid() and public.is_admin());

create or replace function public.caderno_dio_touch() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists caderno_dio_touch on public.caderno_dio;
create trigger caderno_dio_touch before update on public.caderno_dio
  for each row execute function public.caderno_dio_touch();
