-- Caderno QGIS: link público de UMA prática (/pratica?t=CODIGO).
-- Quem recebe o link vê só aquela prática (título, objetivo, blocos, passos, ligações, imagens e anotações salvas)
-- e marca os passos numa cópia própria (fica no aparelho dela). Não alcança mais nada do caderno.
-- Só o dono (logado, admin) cria e desativa links. Pode rodar mais de uma vez.

create table if not exists public.caderno_pratica_links (
  token_hash text primary key,                 -- sha256 do código do link (o código em si não fica no banco)
  user_id    uuid not null references auth.users(id) on delete cascade,
  doc_id     text not null check (doc_id ~ '^prt-[A-Za-z0-9_-]{1,70}$'),
  ativo      boolean not null default true,
  criado     timestamptz not null default now()
);
create index if not exists caderno_pratica_links_doc on public.caderno_pratica_links (user_id, doc_id);
alter table public.caderno_pratica_links enable row level security;
revoke all on public.caderno_pratica_links from anon, authenticated;

create or replace function public.caderno_pratica_hash(p_token text) returns text
language sql immutable set search_path = '' as $$
  select encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(p_token,''), 'UTF8')), 'hex')
$$;

-- dono: cria (ou reativa) o link de uma prática sua
create or replace function public.caderno_pratica_criar(p_token text, p_doc text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'sem permissão' using errcode = '42501'; end if;
  if coalesce(char_length(p_token),0) < 20 then raise exception 'código curto demais' using errcode = '22023'; end if;
  if p_doc !~ '^prt-[A-Za-z0-9_-]{1,70}$' then raise exception 'prática inválida' using errcode = '22023'; end if;
  insert into public.caderno_pratica_links (token_hash, user_id, doc_id)
  values (public.caderno_pratica_hash(p_token), auth.uid(), p_doc)
  on conflict (token_hash) do update set ativo = true
    where public.caderno_pratica_links.user_id = auth.uid();
end $$;

-- dono: desativa todos os links de uma prática
create or replace function public.caderno_pratica_desativar(p_doc text) returns void
language sql security definer set search_path = '' as $$
  update public.caderno_pratica_links set ativo = false where user_id = auth.uid() and doc_id = p_doc
$$;

-- qualquer pessoa com o código: lê só aquela prática
create or replace function public.caderno_pratica_ver(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select pg_catalog.jsonb_build_object('body', n.body, 'atualizado', n.updated_at)
  from public.caderno_pratica_links l
  join public.caderno_notas n on n.user_id = l.user_id and n.id = l.doc_id
  where l.token_hash = public.caderno_pratica_hash(p_token) and l.ativo
  limit 1
$$;

-- imagem pode ser vista por quem tem o link? (só arquivos citados numa prática com link ativo)
create or replace function public.caderno_pratica_img_ok(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.caderno_pratica_links l
    join public.caderno_notas n on n.user_id = l.user_id and n.id = l.doc_id
    where l.ativo
      and split_part(p_name, '/', 1) = l.user_id::text
      and pg_catalog.strpos(n.body::text, 'sb:' || p_name) > 0
  )
$$;

revoke all on function public.caderno_pratica_hash(text), public.caderno_pratica_criar(text, text),
  public.caderno_pratica_desativar(text), public.caderno_pratica_ver(text), public.caderno_pratica_img_ok(text) from public;
grant execute on function public.caderno_pratica_criar(text, text), public.caderno_pratica_desativar(text) to authenticated;
grant execute on function public.caderno_pratica_ver(text), public.caderno_pratica_img_ok(text) to anon, authenticated;

-- Storage: libera só a leitura das imagens dessas práticas (para gerar o endereço temporário da foto)
drop policy if exists caderno_pratica_img on storage.objects;
create policy caderno_pratica_img on storage.objects for select to anon, authenticated
  using (bucket_id = 'caderno' and public.caderno_pratica_img_ok(name));
