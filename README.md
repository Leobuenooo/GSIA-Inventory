# GSIA Inventário

Sistema web para cadastro e consulta do inventário de equipamentos de CFTV
(clientes → locais → equipamentos → câmeras).

## Funcionalidades

- **Pesquisar clientes**: busca por nome, cidade, segmento, ID de cliente,
  ou por ID/nome de um equipamento ou câmera específica. Drill-down completo
  cliente → locais → equipamentos → câmeras.
- **Visão geral**: estatísticas do parque instalado (status de equipamentos
  e câmeras, distribuição por segmento).
- **Novo registro**: cadastro de equipamentos (com câmeras associadas),
  clientes e locais, com geração automática de ID no mesmo padrão da
  planilha original (CLI001, LOC001, EQP001A, CAM001A...).

## Estrutura do projeto

```
gsia-inventario/
├── index.html          Estrutura da página
├── css/
│   └── styles.css      Estilos
├── js/
│   ├── state.js         Estado global da aplicação (DB, seleção atual)
│   ├── listas.js        Listas de opções dos formulários (status, UF, etc.)
│   ├── helpers.js        Funções utilitárias (badges, toasts, geração de ID)
│   ├── data.js            Dados iniciais extraídos da planilha original
│   ├── storage.js         Persistência local (localStorage)
│   ├── render-search.js    Pesquisa e detalhamento de clientes
│   ├── render-overview.js   Painel de visão geral
│   ├── forms.js              Formulários de cadastro
│   ├── nav.js                  Navegação entre telas
│   └── main.js                  Inicialização da aplicação
└── README.md
```

## Como rodar

Abra o `index.html` direto no navegador (duplo clique), ou use a extensão
**Live Server** do VS Code para recarregamento automático durante o
desenvolvimento.

## Dados

Os dados ficam salvos no `localStorage` do navegador — ou seja, por
computador/navegador, não compartilhado entre usuários.
