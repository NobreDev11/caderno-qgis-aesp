-- Caderno QGIS AESP: notas pessoais, no Supabase do Checklist.
-- Cada usuário só lê e grava as próprias linhas, e precisa ser admin (is_admin()).
-- Não altera nenhuma tabela existente. Pode rodar mais de uma vez.

create table if not exists public.caderno_notas (
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  id         text   not null check (char_length(id) between 1 and 80),
  body       jsonb  not null,
  upd        bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.caderno_notas enable row level security;
revoke all on public.caderno_notas from anon;
grant select, insert, update, delete on public.caderno_notas to authenticated;

drop policy if exists caderno_notas_select on public.caderno_notas;
drop policy if exists caderno_notas_insert on public.caderno_notas;
drop policy if exists caderno_notas_update on public.caderno_notas;
drop policy if exists caderno_notas_delete on public.caderno_notas;

create policy caderno_notas_select on public.caderno_notas
  for select to authenticated using (user_id = auth.uid() and public.is_admin());
create policy caderno_notas_insert on public.caderno_notas
  for insert to authenticated with check (user_id = auth.uid() and public.is_admin());
create policy caderno_notas_update on public.caderno_notas
  for update to authenticated using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());
create policy caderno_notas_delete on public.caderno_notas
  for delete to authenticated using (user_id = auth.uid() and public.is_admin());

create or replace function public.caderno_notas_touch() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists caderno_notas_touch on public.caderno_notas;
create trigger caderno_notas_touch before update on public.caderno_notas
  for each row execute function public.caderno_notas_touch();
