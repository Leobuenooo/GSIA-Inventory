// Camada de acesso a dados — fala com o Supabase (Postgres real) via supabase-js.
//
// Cada tabela do banco usa nomes de coluna em snake_case (ver supabase/001_schema.sql),
// enquanto o resto do app (render-search.js, render-overview.js, forms.js) trabalha
// com os mesmos nomes de campo da planilha original (com acento e espaço, ex: "ID Cliente").
// FIELD_MAPS faz a tradução entre os dois mundos para não precisar reescrever a
// aplicação inteira.

const FIELD_MAPS = {
  clientes: [
    ['Empresa responsável','empresa_responsavel'],
    ['ID Cliente','id_cliente'],
    ['Cliente','cliente'],
    ['Segmento','segmento'],
    ['Cidade','cidade'],
    ['UF','uf'],
    ['Endereço','endereco'],
    ['Responsável','responsavel'],
    ['Telefone','telefone'],
    ['E-mail','email'],
    ['Status','status'],
    ['Observações','observacoes'],
    ['Qtde Locais','qtde_locais'],
    ['Qtde Equipamentos','qtde_equipamentos'],
    ['Qtde Câmeras','qtde_cameras'],
    ['Validação','validacao'],
  ],
  locais: [
    ['ID Local','id_local'],
    ['ID Cliente','id_cliente'],
    ['Nome Cliente','nome_cliente'],
    ['Nome do Local','nome_local'],
    ['Cidade/Região','cidade_regiao'],
    ['UF','uf'],
    ['Endereço / Referência','endereco_referencia'],
    ['Qtde Equipamentos','qtde_equipamentos'],
    ['Qtde Câmeras','qtde_cameras'],
    ['Status','status'],
    ['Observações','observacoes'],
    ['Validação','validacao'],
  ],
  equipamentos: [
    ['ID Equipamento','id_equipamento'],
    ['ID Local','id_local'],
    ['ID Cliente','id_cliente'],
    ['Nome Cliente','nome_cliente'],
    ['Nome Local','nome_local'],
    ['Tipo','tipo'],
    ['Nome no SIMNEXT/D-GUARD','nome_sistema'],
    ['Fabricante','fabricante'],
    ['Modelo','modelo'],
    ['Cloud ID / Domínio','cloud_id'],
    ['IPv4 Local','ipv4_local'],
    ['MAC','mac'],
    ['Gateway','gateway'],
    ['Máscara','mascara'],
    ['DNS Primário','dns_primario'],
    ['DNS Secundário','dns_secundario'],
    ['Porta HTTP','porta_http'],
    ['Porta Serviço','porta_servico'],
    ['Firmware','firmware'],
    ['Qtde Canais','qtde_canais'],
    ['Câmeras Cadastradas','cameras_cadastradas'],
    ['Usuário','usuario'],
    ['Senha','senha'],
    ['Status','status'],
    ['Última Atualização','ultima_atualizacao'],
    ['Origem da Informação','origem_informacao'],
    ['Observações','observacoes'],
    ['Validação','validacao'],
  ],
  cameras: [
    ['ID Câmera','id_camera'],
    ['ID Equipamento','id_equipamento'],
    ['ID Local','id_local'],
    ['ID Cliente','id_cliente'],
    ['Nome Cliente','nome_cliente'],
    ['Nome Local','nome_local'],
    ['Canal','canal'],
    ['Nome no Sistema','nome_sistema'],
    ['Tecnologia','tecnologia'],
    ['Fabricante','fabricante'],
    ['IP da câmera (se disponível)','ip_camera'],
    ['Posição / Área','posicao_area'],
    ['Status','status'],
    ['Última Atualização','ultima_atualizacao'],
    ['Observações','observacoes'],
  ],
};

// Colunas de chave primária de cada tabela (usadas em updates/deletes).
const PK_COL = {
  clientes: 'id_cliente',
  locais: 'id_local',
  equipamentos: 'id_equipamento',
  cameras: 'id_camera',
};

function rowToObj(row, tableKey){
  const obj = {};
  FIELD_MAPS[tableKey].forEach(([jsKey, col])=>{
    const v = row[col];
    obj[jsKey] = (v === null || v === undefined) ? '' : v;
  });
  return obj;
}

function objToRow(obj, tableKey){
  const row = {};
  FIELD_MAPS[tableKey].forEach(([jsKey, col])=>{
    const v = obj[jsKey];
    row[col] = (v === '' || v === undefined) ? null : v;
  });
  return row;
}

let supabaseClient = null;

function getClient(){
  if(!supabaseClient){
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Busca as 4 tabelas e popula o estado global DB (ver state.js).
// Retorna true/false para a tela de inicialização (main.js) saber se deu certo.
async function initDB(){
  const client = getClient();
  try{
    const [c, l, e, cam] = await Promise.all([
      client.from('clientes').select('*'),
      client.from('locais').select('*'),
      client.from('equipamentos').select('*'),
      client.from('cameras').select('*'),
    ]);
    if(c.error) throw c.error;
    if(l.error) throw l.error;
    if(e.error) throw e.error;
    if(cam.error) throw cam.error;

    DB.Clientes = c.data.map(r=>rowToObj(r,'clientes'));
    DB.Locais = l.data.map(r=>rowToObj(r,'locais'));
    DB.Equipamentos = e.data.map(r=>rowToObj(r,'equipamentos'));
    DB.Cameras = cam.data.map(r=>rowToObj(r,'cameras'));
    return true;
  }catch(err){
    console.error('Erro ao carregar dados do Supabase', err);
    return false;
  }
}

// Insere um registro novo. Retorna o registro salvo (já convertido de volta
// para o formato usado pelo resto do app), incluindo qualquer valor default
// que o banco tenha preenchido.
async function dbInsert(tableKey, obj){
  const client = getClient();
  const row = objToRow(obj, tableKey);
  const { data, error } = await client.from(tableKey).insert(row).select();
  if(error){
    console.error(`Erro ao inserir em ${tableKey}`, error);
    throw error;
  }
  return rowToObj(data[0], tableKey);
}

async function dbInsertMany(tableKey, objs){
  if(objs.length === 0) return [];
  const client = getClient();
  const rows = objs.map(o=>objToRow(o, tableKey));
  const { data, error } = await client.from(tableKey).insert(rows).select();
  if(error){
    console.error(`Erro ao inserir múltiplos em ${tableKey}`, error);
    throw error;
  }
  return data.map(r=>rowToObj(r, tableKey));
}

// patch: objeto só com os campos que mudaram, nas chaves "com acento" do app
// (ex: { 'Qtde Locais': 3 }).
async function dbUpdate(tableKey, idVal, patch){
  const client = getClient();
  const row = {};
  Object.entries(patch).forEach(([jsKey, val])=>{
    const found = FIELD_MAPS[tableKey].find(([k])=>k===jsKey);
    if(found) row[found[1]] = val;
  });
  const { error } = await client.from(tableKey).update(row).eq(PK_COL[tableKey], idVal);
  if(error){
    console.error(`Erro ao atualizar ${tableKey}`, error);
    throw error;
  }
}

// Exclui um registro pelo ID. Graças ao "on delete cascade" do schema,
// excluir um cliente também apaga seus locais/equipamentos/câmeras
// automaticamente no banco — não precisa fazer isso manualmente aqui.
async function dbDelete(tableKey, idVal){
  const client = getClient();
  const { error } = await client.from(tableKey).delete().eq(PK_COL[tableKey], idVal);
  if(error){
    console.error(`Erro ao excluir de ${tableKey}`, error);
    throw error;
  }
}
