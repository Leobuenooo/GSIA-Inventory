// Camada de persistência da aplicação.
// Usa o localStorage do navegador: os dados ficam salvos por computador/navegador,
// sem compartilhamento entre usuários. Para uso em equipe, isso precisaria virar
// uma API com banco de dados real.

function storageGetSafe(key){
  try{
    return localStorage.getItem(key);
  }catch(e){
    return null;
  }
}

function initDB(){
  let seededFlag = storageGetSafe('db_seeded_v1');
  if(!seededFlag){
    try{
      localStorage.setItem('db_clientes', JSON.stringify(SEED_DATA.Clientes));
      localStorage.setItem('db_locais', JSON.stringify(SEED_DATA.Locais));
      localStorage.setItem('db_equipamentos', JSON.stringify(SEED_DATA.Equipamentos));
      localStorage.setItem('db_cameras', JSON.stringify(SEED_DATA.Cameras));
      localStorage.setItem('db_seeded_v1', 'true');
    }catch(e){
      console.error('Erro ao semear dados iniciais', e);
    }
    DB.Clientes = SEED_DATA.Clientes;
    DB.Locais = SEED_DATA.Locais;
    DB.Equipamentos = SEED_DATA.Equipamentos;
    DB.Cameras = SEED_DATA.Cameras;
  } else {
    const c = storageGetSafe('db_clientes');
    const l = storageGetSafe('db_locais');
    const e = storageGetSafe('db_equipamentos');
    const cam = storageGetSafe('db_cameras');
    DB.Clientes = c ? JSON.parse(c) : SEED_DATA.Clientes;
    DB.Locais = l ? JSON.parse(l) : SEED_DATA.Locais;
    DB.Equipamentos = e ? JSON.parse(e) : SEED_DATA.Equipamentos;
    DB.Cameras = cam ? JSON.parse(cam) : SEED_DATA.Cameras;
  }
}

function persist(part){
  const map = {
    Clientes: 'db_clientes', Locais: 'db_locais',
    Equipamentos: 'db_equipamentos', Cameras: 'db_cameras'
  };
  try{
    localStorage.setItem(map[part], JSON.stringify(DB[part]));
  }catch(e){
    showToast('Não foi possível salvar os dados. Tente novamente.', 'ti-alert-triangle');
    console.error('Erro ao salvar', part, e);
  }
}
