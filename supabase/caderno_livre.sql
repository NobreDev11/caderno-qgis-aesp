-- Cadernos criados no app ("+ Novo caderno"): dados pessoais, no Supabase do Checklist (mesmo login dos cadernos QGIS e DIO).
-- Uma tabela para todos os cadernos livres: a coluna "caderno" separa um do outro.
--   caderno = '_'      → lista de cadernos (id = código do caderno, body = configuração: nome, seções, itens, dias…)
--   caderno = <código> → anotações, materiais, tarefas etc. daquele caderno (mesmo formato das outras tabelas)
-- Cada usuário só lê e grava as próprias linhas, e precisa ser admin (is_admin()).
-- Não altera nenhuma tabela existente. Pode rodar mais de uma vez.
-- PDFs e fotos usam a pasta privada "caderno" do Storage, criada por supabase/caderno_notas.sql.

create table if not exists public.caderno_livre (
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  caderno    text   not null check (char_length(caderno) between 1 and 40),
  id         text   not null check (char_length(id) between 1 and 80),
  body       jsonb  not null,
  upd        bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, caderno, id)
);

create index if not exists caderno_livre_upd on public.caderno_livre (user_id, caderno, updated_at);

alter table public.caderno_livre enable row level security;
revoke all on public.caderno_livre from anon;
grant select, insert, update, delete on public.caderno_livre to authenticated;

drop policy if exists caderno_livre_select on public.caderno_livre;
drop policy if exists caderno_livre_insert on public.caderno_livre;
drop policy if exists caderno_livre_update on public.caderno_livre;
drop policy if exists caderno_livre_delete on public.caderno_livre;

create policy caderno_livre_select on public.caderno_livre
  for select to authenticated using (user_id = auth.uid() and public.is_admin());
create policy caderno_livre_insert on public.caderno_livre
  for insert to authenticated with check (user_id = auth.uid() and public.is_admin());
create policy caderno_livre_update on public.caderno_livre
  for update to authenticated using (user_id = auth.uid() and public.is_admin())
  with check (user_id = auth.uid() and public.is_admin());
create policy caderno_livre_delete on public.caderno_livre
  for delete to authenticated using (user_id = auth.uid() and public.is_admin());

create or replace function public.caderno_livre_touch() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists caderno_livre_touch on public.caderno_livre;
create trigger caderno_livre_touch before update on public.caderno_livre
  for each row execute function public.caderno_livre_touch();
