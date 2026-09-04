-- ============================================================
-- GSIA Inventário — schema do banco (Supabase / PostgreSQL)
-- Rode este arquivo primeiro no SQL Editor do Supabase.
-- ============================================================

create table if not exists clientes (
  id_cliente text primary key,
  empresa_responsavel text,
  cliente text not null,
  segmento text,
  cidade text,
  uf text,
  endereco text,
  responsavel text,
  telefone text,
  email text,
  status text default 'Ativo',
  observacoes text,
  qtde_locais int default 0,
  qtde_equipamentos int default 0,
  qtde_cameras int default 0,
  validacao text,
  criado_em timestamptz default now()
);

create table if not exists locais (
  id_local text primary key,
  id_cliente text not null references clientes(id_cliente) on delete cascade,
  nome_cliente text,
  nome_local text not null,
  cidade_regiao text,
  uf text,
  endereco_referencia text,
  qtde_equipamentos int default 0,
  qtde_cameras int default 0,
  status text default 'Online',
  observacoes text,
  validacao text,
  criado_em timestamptz default now()
);

create table if not exists equipamentos (
  id_equipamento text primary key,
  id_local text not null references locais(id_local) on delete cascade,
  id_cliente text not null references clientes(id_cliente) on delete cascade,
  nome_cliente text,
  nome_local text,
  tipo text not null,
  nome_sistema text,
  fabricante text,
  modelo text,
  cloud_id text,
  ipv4_local text,
  mac text,
  gateway text,
  mascara text,
  dns_primario text,
  dns_secundario text,
  porta_http text,
  porta_servico text,
  firmware text,
  qtde_canais int,
  cameras_cadastradas int default 0,
  usuario text,
  senha text,
  status text default 'Online',
  ultima_atualizacao text,
  origem_informacao text,
  observacoes text,
  validacao text,
  criado_em timestamptz default now()
);

create table if not exists cameras (
  id_camera text primary key,
  id_equipamento text not null references equipamentos(id_equipamento) on delete cascade,
  id_local text not null references locais(id_local) on delete cascade,
  id_cliente text not null references clientes(id_cliente) on delete cascade,
  nome_cliente text,
  nome_local text,
  canal int,
  nome_sistema text,
  tecnologia text,
  fabricante text,
  ip_camera text,
  posicao_area text,
  status text default 'Online',
  ultima_atualizacao text,
  observacoes text,
  criado_em timestamptz default now()
);

-- Índices para acelerar a pesquisa e o drill-down cliente → local → equipamento → câmera
create index if not exists idx_locais_cliente on locais(id_cliente);
create index if not exists idx_equip_local on equipamentos(id_local);
create index if not exists idx_equip_cliente on equipamentos(id_cliente);
create index if not exists idx_cameras_equip on cameras(id_equipamento);
create index if not exists idx_cameras_cliente on cameras(id_cliente);

-- ============================================================
-- Row Level Security
--
-- IMPORTANTE: por padrão o Supabase bloqueia tudo quando o RLS
-- está ligado. As políticas abaixo liberam leitura e escrita
-- para quem tiver a URL + chave "anon" do projeto — ou seja,
-- qualquer pessoa com o link do app consegue ler/gravar/excluir.
-- Isso é aceitável para uma ferramenta interna de uso restrito,
-- mas NÃO é controle de acesso por usuário. Se um dia vocês
-- quiserem exigir login (ex: só o chefe pode excluir), a gente
-- troca essas políticas por regras baseadas em auth.uid().
-- ============================================================

alter table clientes enable row level security;
alter table locais enable row level security;
alter table equipamentos enable row level security;
alter table cameras enable row level security;

create policy "acesso total clientes" on clientes for all using (true) with check (true);
create policy "acesso total locais" on locais for all using (true) with check (true);
create policy "acesso total equipamentos" on equipamentos for all using (true) with check (true);
create policy "acesso total cameras" on cameras for all using (true) with check (true);
