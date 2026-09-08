# GSIA Inventário

Sistema web para cadastro e consulta do inventário de equipamentos de CFTV
(clientes → locais → equipamentos → câmeras), com banco de dados real
(Supabase / PostgreSQL) — os dados são compartilhados entre todo mundo que
acessa o app, não ficam presos a um computador.

## Funcionalidades

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
├── index.html               Estrutura da página
├── css/
│   └── styles.css           Estilos
├── js/
│   ├── state.js              Estado global da aplicação (DB, edição em andamento)
│   ├── listas.js             Listas de opções dos formulários (status, UF, etc.)
│   ├── helpers.js            Funções utilitárias (badges, toasts, geração de ID)
│   ├── config.js              Credenciais do Supabase (preencher você mesmo)
│   ├── storage.js             Acesso ao banco Supabase (CRUD real)
│   ├── actions.js              Exclusão de registros e edição inline de câmeras
│   ├── render-search.js         Pesquisa e detalhamento de clientes
│   ├── render-overview.js        Painel de visão geral
│   ├── forms.js                   Formulários de cadastro e edição
│   ├── nav.js                      Navegação entre telas
│   └── main.js                      Inicialização da aplicação
├── supabase/
│   ├── 001_schema.sql        Tabelas, chaves estrangeiras e permissões
│   └── 002_seed.sql           Dados da planilha original, prontos para importar
└── README.md
```

## Como configurar o banco (Supabase)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um
   projeto novo.
2. No painel do projeto, abra o **SQL Editor** e rode, nessa ordem:
   - o conteúdo de `supabase/001_schema.sql`
   - o conteúdo de `supabase/002_seed.sql` (importa os dados da planilha original)
3. Vá em **Project Settings → Data API** e copie a **Project URL** e a
   chave **anon public**.
4. Cole essas duas informações em `js/config.js`, nos campos `SUPABASE_URL`
   e `SUPABASE_ANON_KEY`.

## Como rodar

Abra o `index.html` direto no navegador (duplo clique), ou use a extensão
**Live Server** do VS Code para recarregamento automático durante o
desenvolvimento. Se aparecer uma tela de erro dizendo que não conseguiu
carregar os dados, confira o passo a passo acima — geralmente é
`js/config.js` sem as credenciais preenchidas.

## Dados e segurança

Os dados agora ficam num banco Postgres real na nuvem (Supabase),
compartilhado entre todos que acessam o app — diferente da versão anterior
com `localStorage`, que ficava presa a um computador.

O acesso ao banco está liberado para quem tiver a URL + chave do projeto
(ver comentário em `supabase/001_schema.sql`), sem exigir login. Isso é
adequado para uso interno restrito. Se no futuro for necessário controlar
quem pode editar/excluir (ex: só o gestor pode excluir), dá para adicionar
login via Supabase Auth e trocar as políticas de RLS.

O plano gratuito do Supabase pausa o projeto automaticamente após 7 dias
sem uso — é só entrar no painel e clicar em "restaurar" (leva menos de um
minuto).
