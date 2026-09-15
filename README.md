# GSIA Inventário

Sistema web para cadastro e consulta do inventário de equipamentos de CFTV
(clientes → locais → equipamentos → câmeras), com banco de dados real
(Supabase / PostgreSQL) e login — os dados são compartilhados entre todo
mundo que acessa o app, e só entra quem tiver uma conta criada.

## Funcionalidades

- **Login**: acesso protegido por e-mail/senha (Supabase Auth). Não tem
  cadastro público — as contas são criadas manualmente pelo administrador.
- **Pesquisar clientes**: busca por nome, cidade, segmento, ID de cliente,
  ou por ID/nome de um equipamento ou câmera específica. Drill-down completo
  cliente → locais → equipamentos → câmeras.
- **Visão geral**: estatísticas do parque instalado (status de equipamentos
  e câmeras, distribuição por segmento).
- **Novo registro**: cadastro de equipamentos (com câmeras associadas),
  clientes e locais, com geração automática de ID no mesmo padrão da
  planilha original (CLI001, LOC001, EQP001A, CAM001A...).
- **Editar**: clientes, locais e equipamentos podem ser editados a partir
  da tela de pesquisa (ícone de lápis). Câmeras são editadas direto na
  linha da tabela (edição inline).
- **Excluir**: clientes, locais, equipamentos e câmeras podem ser excluídos
  (ícone de lixeira), sempre com confirmação antes. Excluir um cliente
  também apaga seus locais/equipamentos/câmeras automaticamente (cascata
  no banco de dados).

## Estrutura do projeto

```
gsia-inventario/
├── index.html               Estrutura da página (inclui a tela de login)
├── css/
│   └── styles.css           Estilos
├── js/
│   ├── state.js              Estado global da aplicação (DB, edição em andamento)
│   ├── listas.js             Listas de opções dos formulários (status, UF, etc.)
│   ├── helpers.js            Funções utilitárias (badges, toasts, geração de ID)
│   ├── config.js              Credenciais do Supabase (preencher você mesmo)
│   ├── storage.js             Acesso ao banco Supabase (CRUD real)
│   ├── auth.js                 Login, logout e verificação de sessão
│   ├── actions.js               Exclusão de registros e edição inline de câmeras
│   ├── render-search.js          Pesquisa e detalhamento de clientes
│   ├── render-overview.js         Painel de visão geral
│   ├── forms.js                    Formulários de cadastro e edição
│   ├── nav.js                       Navegação entre telas
│   └── main.js                       Inicialização da aplicação (login → app)
├── assets/
│   ├── logo.png              Logo da empresa (menu lateral)
│   └── favicon.png           Ícone da aba do navegador
├── supabase/
│   ├── 001_schema.sql        Tabelas, chaves estrangeiras e permissões
│   ├── 002_seed.sql           Dados da planilha original, prontos para importar
│   ├── 003_auth_policies.sql   Fecha o acesso: só usuário logado lê/grava
│   └── 004_cliente_cnpj_plano.sql   Troca telefone/e-mail por CNPJ/Plano
└── README.md
```

## Como configurar o banco (Supabase)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um
   projeto novo.
2. No painel do projeto, abra o **SQL Editor** e rode, nessa ordem:
   - o conteúdo de `supabase/001_schema.sql`
   - o conteúdo de `supabase/002_seed.sql` (importa os dados da planilha original)
   - o conteúdo de `supabase/003_auth_policies.sql` (exige login para acessar os dados)
   - o conteúdo de `supabase/004_cliente_cnpj_plano.sql` (troca telefone/e-mail por CNPJ/Plano)
3. Vá em **Project Settings → Data API** e copie a **Project URL** e a
   chave **anon public**.
4. Cole essas duas informações em `js/config.js`, nos campos `SUPABASE_URL`
   e `SUPABASE_ANON_KEY`.

## Como criar os logins de acesso

Não existe tela de "criar conta" — isso é proposital, pra ninguém de fora
conseguir se cadastrar sozinho. Quem administra o Supabase cria as contas:

1. No painel do Supabase, vá em **Authentication → Users → Add user**.
2. Preencha e-mail e senha da pessoa (você, seu chefe, etc.).
3. Marque **Auto Confirm User** — sem isso, a conta pede confirmação por
   e-mail antes de conseguir logar.
4. Repita pra cada pessoa que precisa de acesso.

## Como rodar localmente

Abra o `index.html` direto no navegador (duplo clique), ou use a extensão
**Live Server** do VS Code para recarregamento automático durante o
desenvolvimento. Se aparecer uma tela de erro dizendo que não conseguiu
carregar os dados, confira o passo a passo acima — geralmente é
`js/config.js` sem as credenciais preenchidas.

## Como publicar pro seu chefe acessar (GitHub Pages)

Isso coloca o app num link público (tipo
`https://seu-usuario.github.io/gsia-inventario/`), sem precisar de você
rodando nada localmente.

1. Suba esse projeto pro GitHub (veja a seção de commits/histórico abaixo
   se estiver reaproveitando um repositório que já existia).
2. No GitHub, vá em **Settings → Pages** do repositório.
3. Em "Source", escolha **Deploy from a branch**, branch **main**, pasta
   **/ (root)**. Salve.
4. Espere cerca de 1 minuto. O GitHub mostra o link do site no topo dessa
   mesma página — é esse link que você compartilha.

O `js/config.js` com a URL/chave do Supabase fica público nesse link, e
isso é esperado — a chave "anon" é feita pra ser pública, e agora a
segurança de verdade está nas políticas de login (`003_auth_policies.sql`),
não em esconder essa chave.

## Dados e segurança

Os dados ficam num banco Postgres real na nuvem (Supabase), compartilhado
entre todos que acessam o app.

Desde `003_auth_policies.sql`, só consegue ler ou gravar dados quem
estiver logado — tanto a tela de login quanto o próprio banco (RLS)
bloqueiam quem não tem conta. Antes disso, o acesso era aberto pra
qualquer pessoa com a URL + chave; isso foi corrigido.

O plano gratuito do Supabase pausa o projeto automaticamente após 7 dias
sem uso — é só entrar no painel e clicar em "restaurar" (leva menos de um
minuto).
