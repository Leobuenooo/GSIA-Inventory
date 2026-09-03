// Estado global da aplicação em memória.
// DB é populado a partir do localStorage (ou dos dados semente) em storage.js.
let DB = { Clientes: [], Locais: [], Equipamentos: [], Cameras: [] };
let currentClientId = null;
let camRowCount = 0;
