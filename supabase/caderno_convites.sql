-- Caderno QGIS: links pessoais de convidado (/qgis?c=CODIGO), sem conta no Supabase do CBMCE.
-- O convidado só alcança as próprias notas, pelo código do link. Nada de Checklist/portal fica acessível.
-- As tabelas não têm política: ninguém lê pela API direta; só pelas funções abaixo, que conferem o código.
-- Pode rodar mais de uma vez.

create table if not exists public.caderno_convites (
  token_hash text primary key,              -- sha256 do código do link (o código em si não fica no banco)
  nome       text not null,
  ativo      boolean not null default true,
  criado     timestamptz not null default now()
);
create table if not exists public.caderno_conv_notas (
  token_hash text not null references public.caderno_convites(token_hash) on delete cascade,
  id         text not null check (char_length(id) between 1 and 80),
  body       jsonb not null,
  upd        bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (token_hash, id)
);
alter table public.caderno_convites   enable row level security;
alter table public.caderno_conv_notas enable row level security;
revoke all on public.caderno_convites, public.caderno_conv_notas from anon, authenticated;

create or replace function public.caderno_conv_hash(p_token text) returns text
language sql immutable set search_path = '' as $$
  select encode(pg_catalog.sha256(pg_catalog.convert_to(coalesce(p_token,''), 'UTF8')), 'hex')
$$;

create or replace function public.caderno_conv_info(p_token text) returns text
language sql stable security definer set search_path = '' as $$
  select c.nome from public.caderno_convites c
  where c.token_hash = public.caderno_conv_hash(p_token) and c.ativo
$$;

create or replace function public.caderno_conv_ler(p_token text, p_desde timestamptz default null)
returns table (id text, body jsonb, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.body, n.updated_at
  from public.caderno_conv_notas n
  join public.caderno_convites c on c.token_hash = n.token_hash and c.ativo
  where n.token_hash = public.caderno_conv_hash(p_token)
    and (p_desde is null or n.updated_at >= p_desde)
  order by n.updated_at
$$;

create or replace function public.caderno_conv_salvar(p_token text, p_id text, p_body jsonb, p_upd bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare h text := public.caderno_conv_hash(p_token);
begin
  if not exists (select 1 from public.caderno_convites where token_hash = h and ativo) then
    raise exception 'link inválido ou desativado' using errcode = '28000';
  end if;
  if p_id !~ '^[a-z]+-[A-Za-z0-9_-]{1,70}$' then raise exception 'id inválido' using errcode = '22023'; end if;
  if pg_catalog.octet_length(p_body::text) > 4000000 then raise exception 'item grande demais' using errcode = '54000'; end if;
  if not exists (select 1 from public.caderno_conv_notas where token_hash = h and id = p_id)
     and (select count(*) from public.caderno_conv_notas where token_hash = h) >= 5000 then
    raise exception 'limite de itens atingido' using errcode = '54000';
  end if;
  insert into public.caderno_conv_notas as n (token_hash, id, body, upd, updated_at)
  values (h, p_id, p_body, coalesce(p_upd, 0), now())
  on conflict (token_hash, id) do update set body = excluded.body, upd = excluded.upd, updated_at = now();
end $$;

revoke all on function public.caderno_conv_hash(text), public.caderno_conv_info(text),
  public.caderno_conv_ler(text, timestamptz), public.caderno_conv_salvar(text, text, jsonb, bigint) from public;
grant execute on function public.caderno_conv_info(text), public.caderno_conv_ler(text, timestamptz),
  public.caderno_conv_salvar(text, text, jsonb, bigint) to anon, authenticated;
grant execute on function public.caderno_conv_hash(text) to anon, authenticated;

-- ===== Convites =====
-- Para criar outro: gere um código novo (20+ letras/números), calcule o sha256 e insira aqui.
-- Para desativar: update public.caderno_convites set ativo = false where nome = 'Colega 1';
insert into public.caderno_convites (token_hash, nome)
values ('414268efc5fb98fe7d72b30527d1b1f6adc8bcf7c1a0cd4e721bf61c899540d7', 'Colega 1')
on conflict (token_hash) do nothing;
