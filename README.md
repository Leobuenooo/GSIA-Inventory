# GSIA Inventário

Sistema web para cadastro e consulta do inventário de equipamentos de CFTV
(clientes → locais → equipamentos → câmeras).

> Em desenvolvimento. Este README será atualizado conforme o projeto evolui.

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
