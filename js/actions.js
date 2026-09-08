// Ações de exclusão. O banco já cuida do "on delete cascade" (ver
// supabase/001_schema.sql) — excluir um cliente apaga automaticamente
// seus locais/equipamentos/câmeras no Postgres. Aqui só espelhamos essas
// remoções no estado em memória (DB) e recalculamos os contadores dos
// registros "pai" que sobraram.

async function deleteCliente(clienteId){
  const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
  if(!cliente) return;
  const ok = confirm(`Excluir o cliente "${cliente['Cliente']}"?\n\nIsso vai excluir também todos os locais, equipamentos e câmeras associados a ele. Essa ação não pode ser desfeita.`);
  if(!ok) return;

  try{
    await dbDelete('clientes', clienteId);
    DB.Locais = DB.Locais.filter(l=>l['ID Cliente']!==clienteId);
    DB.Equipamentos = DB.Equipamentos.filter(e=>e['ID Cliente']!==clienteId);
    DB.Cameras = DB.Cameras.filter(c=>c['ID Cliente']!==clienteId);
    DB.Clientes = DB.Clientes.filter(c=>c['ID Cliente']!==clienteId);

    showToast(`Cliente ${clienteId} excluído.`);
    closeClientDetail();
    renderClientList();
    renderSidebarStats();
    refreshEquipClienteOptions();
    refreshLocalClienteOptions();
  }catch(err){
    showToast('Não foi possível excluir. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

async function deleteLocal(localId){
  const local = DB.Locais.find(l=>l['ID Local']===localId);
  if(!local) return;
  const ok = confirm(`Excluir o local "${local['Nome do Local']}"?\n\nIsso vai excluir também os equipamentos e câmeras associados a ele. Essa ação não pode ser desfeita.`);
  if(!ok) return;

  try{
    await dbDelete('locais', localId);
    const clienteId = local['ID Cliente'];
    DB.Equipamentos = DB.Equipamentos.filter(e=>e['ID Local']!==localId);
    DB.Cameras = DB.Cameras.filter(c=>c['ID Local']!==localId);
    DB.Locais = DB.Locais.filter(l=>l['ID Local']!==localId);

    const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
    if(cliente){
      const patch = {
        'Qtde Locais': DB.Locais.filter(l=>l['ID Cliente']===clienteId).length,
        'Qtde Equipamentos': DB.Equipamentos.filter(e=>e['ID Cliente']===clienteId).length,
        'Qtde Câmeras': DB.Cameras.filter(c=>c['ID Cliente']===clienteId).length,
      };
      await dbUpdate('clientes', clienteId, patch);
      Object.assign(cliente, patch);
    }

    showToast(`Local ${localId} excluído.`);
    if(currentClientId) openClientDetail(currentClientId);
    renderSidebarStats();
  }catch(err){
    showToast('Não foi possível excluir. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

async function deleteEquipamento(equipId){
  const equip = DB.Equipamentos.find(e=>e['ID Equipamento']===equipId);
  if(!equip) return;
  const ok = confirm(`Excluir o equipamento ${equipId}?\n\nIsso vai excluir também as câmeras associadas a ele. Essa ação não pode ser desfeita.`);
  if(!ok) return;

  const localId = equip['ID Local'];
  const clienteId = equip['ID Cliente'];

  try{
    await dbDelete('equipamentos', equipId);
    DB.Cameras = DB.Cameras.filter(c=>c['ID Equipamento']!==equipId);
    DB.Equipamentos = DB.Equipamentos.filter(e=>e['ID Equipamento']!==equipId);

    const local = DB.Locais.find(l=>l['ID Local']===localId);
    if(local){
      const patchLocal = {
        'Qtde Equipamentos': DB.Equipamentos.filter(e=>e['ID Local']===localId).length,
        'Qtde Câmeras': DB.Cameras.filter(c=>c['ID Local']===localId).length,
      };
      await dbUpdate('locais', localId, patchLocal);
      Object.assign(local, patchLocal);
    }
    const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
    if(cliente){
      const patchCliente = {
        'Qtde Equipamentos': DB.Equipamentos.filter(e=>e['ID Cliente']===clienteId).length,
        'Qtde Câmeras': DB.Cameras.filter(c=>c['ID Cliente']===clienteId).length,
      };
      await dbUpdate('clientes', clienteId, patchCliente);
      Object.assign(cliente, patchCliente);
    }

    showToast(`Equipamento ${equipId} excluído.`);
    if(currentClientId) openClientDetail(currentClientId);
    renderSidebarStats();
  }catch(err){
    showToast('Não foi possível excluir. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

async function deleteCamera(camId){
  const cam = DB.Cameras.find(c=>c['ID Câmera']===camId);
  if(!cam) return;
  const ok = confirm(`Excluir a câmera ${camId} (${cam['Nome no Sistema']||'sem nome'})?\n\nEssa ação não pode ser desfeita.`);
  if(!ok) return;

  const equipId = cam['ID Equipamento'];
  const localId = cam['ID Local'];
  const clienteId = cam['ID Cliente'];

  try{
    await dbDelete('cameras', camId);
    DB.Cameras = DB.Cameras.filter(c=>c['ID Câmera']!==camId);

    const equip = DB.Equipamentos.find(e=>e['ID Equipamento']===equipId);
    if(equip){
      const novaQtde = DB.Cameras.filter(c=>c['ID Equipamento']===equipId).length;
      await dbUpdate('equipamentos', equipId, {'Câmeras Cadastradas': novaQtde});
      equip['Câmeras Cadastradas'] = novaQtde;
    }
    const local = DB.Locais.find(l=>l['ID Local']===localId);
    if(local){
      const novaQtde = DB.Cameras.filter(c=>c['ID Local']===localId).length;
      await dbUpdate('locais', localId, {'Qtde Câmeras': novaQtde});
      local['Qtde Câmeras'] = novaQtde;
    }
    const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
    if(cliente){
      const novaQtde = DB.Cameras.filter(c=>c['ID Cliente']===clienteId).length;
      await dbUpdate('clientes', clienteId, {'Qtde Câmeras': novaQtde});
      cliente['Qtde Câmeras'] = novaQtde;
    }

    showToast(`Câmera ${camId} excluída.`);
    if(currentClientId) openClientDetail(currentClientId);
    renderSidebarStats();
  }catch(err){
    showToast('Não foi possível excluir. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

// Edição rápida de uma câmera direto na linha da tabela (sem abrir formulário).
async function saveInlineCamera(camId, tr){
  const canal = tr.querySelector('.ic-canal').value;
  const patch = {
    'Canal': canal ? Number(canal) : '',
    'Nome no Sistema': tr.querySelector('.ic-nome').value.trim(),
    'Tecnologia': tr.querySelector('.ic-tech').value,
    'IP da câmera (se disponível)': tr.querySelector('.ic-ip').value.trim(),
    'Posição / Área': tr.querySelector('.ic-pos').value.trim(),
    'Status': tr.querySelector('.ic-status').value,
  };
  try{
    await dbUpdate('cameras', camId, patch);
    const cam = DB.Cameras.find(c=>c['ID Câmera']===camId);
    Object.assign(cam, patch);
    showToast(`Câmera ${camId} atualizada.`);
    if(currentClientId) openClientDetail(currentClientId);
  }catch(err){
    showToast('Não foi possível salvar. Verifique sua conexão.', 'ti-alert-triangle');
  }
}
