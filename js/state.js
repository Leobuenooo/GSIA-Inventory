// Estado global da aplicação em memória.
// DB é populado a partir do Supabase em storage.js.
let DB = { Clientes: [], Locais: [], Equipamentos: [], Cameras: [] };
let currentClientId = null;
let camRowCount = 0;

// Controla se os formulários de cadastro estão criando um registro novo
// (null) ou editando um já existente (guarda o ID do registro em edição).
let editingClienteId = null;
let editingLocalId = null;
let editingEquipId = null;
