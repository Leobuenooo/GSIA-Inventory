// Formulários de cadastro: equipamento (+ câmeras), cliente e local.
// Cada formulário serve tanto para CRIAR um registro novo quanto para
// EDITAR um já existente — controlado pelas variáveis editingClienteId /
// editingLocalId / editingEquipId (ver state.js).

function addCamRow(){
  const wrap = document.getElementById('camRows');
  if(camRowCount === 0){
    const head = document.createElement('div');
    head.className = 'cam-row-head';
    head.innerHTML = `<div>Canal</div><div>Nome</div><div>Tecnologia</div><div>Fabricante</div><div>IP</div><div>Posição/área</div><div></div>`;
    wrap.appendChild(head);
  }
  camRowCount++;
  const row = document.createElement('div');
  row.className = 'cam-row';
  const techOptions = LISTAS.tecnologiaCamera.map(t=>`<option value="${t}">${t}</option>`).join('');
  row.innerHTML = `
    <input type="number" min="1" placeholder="${camRowCount}" value="${camRowCount}" class="cr-canal">
    <input type="text" placeholder="Nome no sistema" class="cr-nome">
    <select class="cr-tech"><option value="">Tecnologia</option>${techOptions}</select>
    <input type="text" placeholder="Fabricante" value="Intelbras" class="cr-fab">
    <input type="text" placeholder="IP (opcional)" class="cr-ip">
    <input type="text" placeholder="Posição/área" class="cr-pos">
    <button class="ghost cr-remove" title="Remover" aria-label="Remover câmera" type="button"><i class="ti ti-x"></i></button>
  `;
  row.querySelector('.cr-remove').addEventListener('click', ()=>{
    row.remove();
  });
  wrap.appendChild(row);
}

function resetCamRows(){
  document.getElementById('camRows').innerHTML = '';
  camRowCount = 0;
}

function refreshEquipClienteOptions(){
  const sel = document.getElementById('eq_cliente');
  const clientes = [...DB.Clientes].sort((a,b)=>(a['Cliente']||'').localeCompare(b['Cliente']||''));
  sel.innerHTML = `<option value="">Selecione o cliente</option>` + clientes.map(c=>`<option value="${c['ID Cliente']}">${escapeHtml(c['Cliente'])} (${c['ID Cliente']})</option>`).join('');
}

function refreshEquipLocalOptions(){
  const clienteId = document.getElementById('eq_cliente').value;
  const sel = document.getElementById('eq_local');
  const novoFields = document.getElementById('eq_novolocal_fields');
  if(!clienteId){
    sel.innerHTML = `<option value="">Selecione o cliente primeiro</option>`;
    novoFields.style.display = 'none';
    return;
  }
  const locais = DB.Locais.filter(l=>l['ID Cliente']===clienteId);
  const novoOption = editingEquipId ? '' : `<option value="__novo__">+ Cadastrar novo local</option>`;
  sel.innerHTML = `<option value="">Selecione o local</option>` +
    locais.map(l=>`<option value="${l['ID Local']}">${escapeHtml(l['Nome do Local'])}</option>`).join('') +
    novoOption;
  novoFields.style.display = 'none';
}

function fieldError(el, show, msg){
  const field = el.closest('.field');
  field.classList.toggle('error', show);
  let err = field.querySelector('.err-text');
  if(show){
    if(!err){ err = document.createElement('div'); err.className='err-text'; field.appendChild(err); }
    err.textContent = msg || 'Campo obrigatório';
  } else if(err){
    err.remove();
  }
}

// ---------------------------------------------------------------
// EQUIPAMENTO
// ---------------------------------------------------------------

function startEditEquipamento(equipId){
  const equip = DB.Equipamentos.find(e=>e['ID Equipamento']===equipId);
  if(!equip) return;
  editingEquipId = equipId;

  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector('.nav-item[data-view="cadastro"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-cadastro').classList.add('active');
  document.querySelectorAll('.subform-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.subform-tab[data-sub="equipamento"]').classList.add('active');
  ['equipamento','cliente','local'].forEach(k=>{
    document.getElementById('sub-'+k).style.display = (k==='equipamento') ? 'block' : 'none';
  });

  refreshEquipClienteOptions();
  document.getElementById('eq_cliente').value = equip['ID Cliente'];
  refreshEquipLocalOptions();
  document.getElementById('eq_local').value = equip['ID Local'];
  document.getElementById('eq_cliente').disabled = true;
  document.getElementById('eq_local').disabled = true;

  document.getElementById('eq_tipo').value = equip['Tipo'] || '';
  document.getElementById('eq_nome').value = equip['Nome no SIMNEXT/D-GUARD'] || '';
  document.getElementById('eq_fab').value = equip['Fabricante'] || '';
  document.getElementById('eq_modelo').value = equip['Modelo'] || '';
  document.getElementById('eq_cloud').value = equip['Cloud ID / Domínio'] || '';
  document.getElementById('eq_firmware').value = equip['Firmware'] || '';
  document.getElementById('eq_canais').value = equip['Qtde Canais'] || '';
  document.getElementById('eq_status').value = equip['Status'] || 'Online';
  document.getElementById('eq_ip').value = equip['IPv4 Local'] || '';
  document.getElementById('eq_mac').value = equip['MAC'] || '';
  document.getElementById('eq_gw').value = equip['Gateway'] || '';
  document.getElementById('eq_mask').value = equip['Máscara'] || '';
  document.getElementById('eq_dns1').value = equip['DNS Primário'] || '';
  document.getElementById('eq_dns2').value = equip['DNS Secundário'] || '';
  document.getElementById('eq_porthttp').value = equip['Porta HTTP'] || '';
  document.getElementById('eq_portsvc').value = equip['Porta Serviço'] || '';
  document.getElementById('eq_user').value = equip['Usuário'] || '';
  document.getElementById('eq_pass').value = equip['Senha'] || '';
  document.getElementById('eq_origem').value = equip['Origem da Informação'] || '';
  document.getElementById('eq_obs').value = equip['Observações'] || '';

  document.getElementById('eq_cameras_section').style.display = 'none';
  document.getElementById('eq_cameras_edit_hint').style.display = 'block';

  const banner = document.getElementById('eq_editBanner');
  banner.innerHTML = `<i class="ti ti-pencil"></i> Editando o equipamento ${escapeHtml(equipId)}`;
  banner.style.display = 'flex';
  document.getElementById('saveEquip').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar alterações';
  document.getElementById('cancelEditEquip').style.display = 'inline-flex';

  window.scrollTo({top:0, behavior:'smooth'});
}

function cancelEditEquip(){
  resetEquipForm();
}

async function saveEquipamento(){
  const tipo = document.getElementById('eq_tipo').value;

  if(editingEquipId){
    fieldError(document.getElementById('eq_tipo'), !tipo);
    if(!tipo){ showToast('Preencha os campos obrigatórios destacados.', 'ti-alert-triangle'); return; }

    const equip = DB.Equipamentos.find(e=>e['ID Equipamento']===editingEquipId);
    const patch = {
      'Tipo': tipo,
      'Nome no SIMNEXT/D-GUARD': document.getElementById('eq_nome').value.trim(),
      'Fabricante': document.getElementById('eq_fab').value.trim(),
      'Modelo': document.getElementById('eq_modelo').value.trim(),
      'Cloud ID / Domínio': document.getElementById('eq_cloud').value.trim(),
      'Firmware': document.getElementById('eq_firmware').value.trim(),
      'Qtde Canais': document.getElementById('eq_canais').value ? Number(document.getElementById('eq_canais').value) : '',
      'Status': document.getElementById('eq_status').value || 'Online',
      'IPv4 Local': document.getElementById('eq_ip').value.trim(),
      'MAC': document.getElementById('eq_mac').value.trim(),
      'Gateway': document.getElementById('eq_gw').value.trim(),
      'Máscara': document.getElementById('eq_mask').value.trim(),
      'DNS Primário': document.getElementById('eq_dns1').value.trim(),
      'DNS Secundário': document.getElementById('eq_dns2').value.trim(),
      'Porta HTTP': document.getElementById('eq_porthttp').value,
      'Porta Serviço': document.getElementById('eq_portsvc').value,
      'Usuário': document.getElementById('eq_user').value.trim(),
      'Senha': document.getElementById('eq_pass').value.trim(),
      'Origem da Informação': document.getElementById('eq_origem').value,
      'Observações': document.getElementById('eq_obs').value.trim(),
    };

    try{
      await dbUpdate('equipamentos', editingEquipId, patch);
      Object.assign(equip, patch);
      showToast(`Equipamento ${editingEquipId} atualizado com sucesso.`);
      resetEquipForm();
    }catch(err){
      showToast('Não foi possível salvar as alterações. Verifique sua conexão.', 'ti-alert-triangle');
    }
    return;
  }

  // Fluxo de criação (igual antes, agora gravando no Supabase)
  const clienteId = document.getElementById('eq_cliente').value;
  let localSel = document.getElementById('eq_local').value;
  let valid = true;

  fieldError(document.getElementById('eq_cliente'), !clienteId);
  if(!clienteId) valid = false;
  fieldError(document.getElementById('eq_local'), !localSel);
  if(!localSel) valid = false;
  fieldError(document.getElementById('eq_tipo'), !tipo);
  if(!tipo) valid = false;

  let novoLocalNome = '';
  if(localSel === '__novo__'){
    novoLocalNome = document.getElementById('eq_nl_nome').value.trim();
    fieldError(document.getElementById('eq_nl_nome'), !novoLocalNome);
    if(!novoLocalNome) valid = false;
  }

  if(!valid){
    showToast('Preencha os campos obrigatórios destacados.', 'ti-alert-triangle');
    return;
  }

  const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
  let localId = localSel;
  let localObj;

  try{
    if(localSel === '__novo__'){
      localId = nextId('LOC', DB.Locais, 'ID Local');
      localObj = {
        'ID Local': localId, 'ID Cliente': clienteId, 'Nome Cliente': cliente['Cliente'],
        'Nome do Local': novoLocalNome,
        'Cidade/Região': document.getElementById('eq_nl_cidade').value.trim(),
        'UF': document.getElementById('eq_nl_uf').value,
        'Endereço / Referência': document.getElementById('eq_nl_end').value.trim(),
        'Qtde Equipamentos': 0, 'Qtde Câmeras': 0, 'Status': 'Online', 'Observações': '', 'Validação': 'OK'
      };
      const savedLocal = await dbInsert('locais', localObj);
      DB.Locais.push(savedLocal);
      localObj = savedLocal;
    } else {
      localObj = DB.Locais.find(l=>l['ID Local']===localId);
    }

    const equipId = nextChildId('EQP', DB.Equipamentos, 'ID Equipamento', 'ID Local', localId);
    const canaisVal = document.getElementById('eq_canais').value;

    const equip = {
      'ID Equipamento': equipId, 'ID Local': localId, 'ID Cliente': clienteId,
      'Nome Cliente': cliente['Cliente'], 'Nome Local': localObj['Nome do Local'],
      'Tipo': tipo,
      'Nome no SIMNEXT/D-GUARD': document.getElementById('eq_nome').value.trim(),
      'Fabricante': document.getElementById('eq_fab').value.trim(),
      'Modelo': document.getElementById('eq_modelo').value.trim(),
      'Cloud ID / Domínio': document.getElementById('eq_cloud').value.trim(),
      'IPv4 Local': document.getElementById('eq_ip').value.trim(),
      'MAC': document.getElementById('eq_mac').value.trim(),
      'Gateway': document.getElementById('eq_gw').value.trim(),
      'Máscara': document.getElementById('eq_mask').value.trim(),
      'DNS Primário': document.getElementById('eq_dns1').value.trim(),
      'DNS Secundário': document.getElementById('eq_dns2').value.trim(),
      'Porta HTTP': document.getElementById('eq_porthttp').value,
      'Porta Serviço': document.getElementById('eq_portsvc').value,
      'Firmware': document.getElementById('eq_firmware').value.trim(),
      'Qtde Canais': canaisVal ? Number(canaisVal) : '',
      'Câmeras Cadastradas': 0,
      'Usuário': document.getElementById('eq_user').value.trim(),
      'Senha': document.getElementById('eq_pass').value.trim(),
      'Status': document.getElementById('eq_status').value || 'Online',
      'Última Atualização': '',
      'Origem da Informação': document.getElementById('eq_origem').value,
      'Observações': document.getElementById('eq_obs').value.trim(),
      'Validação': 'OK'
    };

    const savedEquip = await dbInsert('equipamentos', equip);
    DB.Equipamentos.push(savedEquip);

    const camRows = document.querySelectorAll('#camRows .cam-row');
    const novasCameras = [];
    camRows.forEach(row=>{
      const nome = row.querySelector('.cr-nome').value.trim();
      const canal = row.querySelector('.cr-canal').value;
      if(!nome && !canal) return;
      const camId = nextChildId('CAM', [...DB.Cameras, ...novasCameras], 'ID Câmera', 'ID Equipamento', equipId);
      novasCameras.push({
        'ID Câmera': camId, 'ID Equipamento': equipId, 'ID Local': localId, 'ID Cliente': clienteId,
        'Nome Cliente': cliente['Cliente'], 'Nome Local': localObj['Nome do Local'],
        'Canal': canal ? Number(canal) : '',
        'Nome no Sistema': nome,
        'Tecnologia': row.querySelector('.cr-tech').value,
        'Fabricante': row.querySelector('.cr-fab').value.trim(),
        'IP da câmera (se disponível)': row.querySelector('.cr-ip').value.trim(),
        'Posição / Área': row.querySelector('.cr-pos').value.trim(),
        'Status': 'Online', 'Última Atualização': '', 'Observações': ''
      });
    });

    let camCount = 0;
    if(novasCameras.length){
      const savedCams = await dbInsertMany('cameras', novasCameras);
      DB.Cameras.push(...savedCams);
      camCount = savedCams.length;
    }

    if(camCount > 0){
      await dbUpdate('equipamentos', equipId, {'Câmeras Cadastradas': camCount});
      savedEquip['Câmeras Cadastradas'] = camCount;
    }

    const novaQtdeEquipLocal = DB.Equipamentos.filter(e=>e['ID Local']===localId).length;
    const novaQtdeCamLocal = DB.Cameras.filter(c=>c['ID Local']===localId).length;
    await dbUpdate('locais', localId, {'Qtde Equipamentos': novaQtdeEquipLocal, 'Qtde Câmeras': novaQtdeCamLocal});
    localObj['Qtde Equipamentos'] = novaQtdeEquipLocal;
    localObj['Qtde Câmeras'] = novaQtdeCamLocal;

    const novaQtdeLocaisCliente = DB.Locais.filter(l=>l['ID Cliente']===clienteId).length;
    const novaQtdeEquipCliente = DB.Equipamentos.filter(e=>e['ID Cliente']===clienteId).length;
    const novaQtdeCamCliente = DB.Cameras.filter(c=>c['ID Cliente']===clienteId).length;
    await dbUpdate('clientes', clienteId, {
      'Qtde Locais': novaQtdeLocaisCliente,
      'Qtde Equipamentos': novaQtdeEquipCliente,
      'Qtde Câmeras': novaQtdeCamCliente
    });
    cliente['Qtde Locais'] = novaQtdeLocaisCliente;
    cliente['Qtde Equipamentos'] = novaQtdeEquipCliente;
    cliente['Qtde Câmeras'] = novaQtdeCamCliente;

    showToast(`Equipamento ${equipId} cadastrado com sucesso.`);
    resetEquipForm();
    renderSidebarStats();
  }catch(err){
    showToast('Não foi possível salvar no banco. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

function resetEquipForm(){
  editingEquipId = null;
  document.getElementById('eq_cliente').disabled = false;
  document.getElementById('eq_local').disabled = false;
  document.getElementById('eq_cliente').value = '';
  refreshEquipLocalOptions();
  ['eq_nome','eq_modelo','eq_cloud','eq_firmware','eq_canais','eq_ip','eq_mac','eq_gw','eq_dns1','eq_dns2','eq_user','eq_pass','eq_obs','eq_nl_nome','eq_nl_cidade','eq_nl_end']
    .forEach(id=> document.getElementById(id).value = '');
  document.getElementById('eq_fab').value = 'Intelbras';
  document.getElementById('eq_mask').value = '255.255.255.0';
  document.getElementById('eq_porthttp').value = '80';
  document.getElementById('eq_portsvc').value = '37777';
  document.getElementById('eq_tipo').value = '';
  document.getElementById('eq_status').value = 'Online';
  document.getElementById('eq_origem').value = '';
  resetCamRows();
  addCamRow();
  document.getElementById('eq_cameras_section').style.display = 'block';
  document.getElementById('eq_cameras_edit_hint').style.display = 'none';
  document.getElementById('eq_editBanner').style.display = 'none';
  document.getElementById('saveEquip').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar equipamento';
  document.getElementById('cancelEditEquip').style.display = 'none';
  document.querySelectorAll('#sub-equipamento .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}

// ---------------------------------------------------------------
// CLIENTE
// ---------------------------------------------------------------

function startEditCliente(clienteId){
  const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
  if(!cliente) return;
  editingClienteId = clienteId;

  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector('.nav-item[data-view="cadastro"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-cadastro').classList.add('active');
  document.querySelectorAll('.subform-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.subform-tab[data-sub="cliente"]').classList.add('active');
  ['equipamento','cliente','local'].forEach(k=>{
    document.getElementById('sub-'+k).style.display = (k==='cliente') ? 'block' : 'none';
  });

  document.getElementById('cl_empresa').value = cliente['Empresa responsável'] || '';
  document.getElementById('cl_nome').value = cliente['Cliente'] || '';
  document.getElementById('cl_segmento').value = cliente['Segmento'] || '';
  document.getElementById('cl_cidade').value = cliente['Cidade'] || '';
  document.getElementById('cl_uf').value = cliente['UF'] || 'SP';
  document.getElementById('cl_endereco').value = cliente['Endereço'] || '';
  document.getElementById('cl_responsavel').value = cliente['Responsável'] || '';
  document.getElementById('cl_telefone').value = cliente['Telefone'] || '';
  document.getElementById('cl_email').value = cliente['E-mail'] || '';
  document.getElementById('cl_status').value = cliente['Status'] || 'Ativo';
  document.getElementById('cl_obs').value = cliente['Observações'] || '';

  const banner = document.getElementById('cl_editBanner');
  banner.innerHTML = `<i class="ti ti-pencil"></i> Editando o cliente ${escapeHtml(clienteId)}`;
  banner.style.display = 'flex';
  document.getElementById('saveCliente').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar alterações';
  document.getElementById('cancelEditCliente').style.display = 'inline-flex';

  window.scrollTo({top:0, behavior:'smooth'});
}

function cancelEditCliente(){
  resetClienteForm();
}

async function saveClienteForm(){
  const nome = document.getElementById('cl_nome').value.trim();
  const empresa = document.getElementById('cl_empresa').value.trim();
  const cidade = document.getElementById('cl_cidade').value.trim();
  let valid = true;
  fieldError(document.getElementById('cl_nome'), !nome); if(!nome) valid=false;
  fieldError(document.getElementById('cl_empresa'), !empresa); if(!empresa) valid=false;
  fieldError(document.getElementById('cl_cidade'), !cidade); if(!cidade) valid=false;
  if(!valid){ showToast('Preencha os campos obrigatórios destacados.','ti-alert-triangle'); return; }

  const patch = {
    'Empresa responsável': empresa,
    'Cliente': nome,
    'Segmento': document.getElementById('cl_segmento').value,
    'Cidade': cidade,
    'UF': document.getElementById('cl_uf').value,
    'Endereço': document.getElementById('cl_endereco').value.trim(),
    'Responsável': document.getElementById('cl_responsavel').value.trim(),
    'Telefone': document.getElementById('cl_telefone').value.trim(),
    'E-mail': document.getElementById('cl_email').value.trim(),
    'Status': document.getElementById('cl_status').value || 'Ativo',
    'Observações': document.getElementById('cl_obs').value.trim(),
  };

  try{
    if(editingClienteId){
      await dbUpdate('clientes', editingClienteId, patch);
      const cliente = DB.Clientes.find(c=>c['ID Cliente']===editingClienteId);
      Object.assign(cliente, patch);
      showToast(`Cliente ${editingClienteId} atualizado com sucesso.`);
    } else {
      const novoCliente = Object.assign({
        'Qtde Locais': 0, 'Qtde Equipamentos': 0, 'Qtde Câmeras': 0, 'Validação': 'OK'
      }, patch);
      const id = nextId('CLI', DB.Clientes, 'ID Cliente');
      novoCliente['ID Cliente'] = id;
      const saved = await dbInsert('clientes', novoCliente);
      DB.Clientes.push(saved);
      showToast(`Cliente ${id} cadastrado com sucesso.`);
    }
    resetClienteForm();
    renderSidebarStats();
    refreshEquipClienteOptions();
    refreshLocalClienteOptions();
  }catch(err){
    showToast('Não foi possível salvar no banco. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

function resetClienteForm(){
  editingClienteId = null;
  ['cl_empresa','cl_nome','cl_cidade','cl_endereco','cl_responsavel','cl_telefone','cl_email','cl_obs']
    .forEach(id=> document.getElementById(id).value='');
  document.getElementById('cl_segmento').value='';
  document.getElementById('cl_uf').value='SP';
  document.getElementById('cl_status').value='Ativo';
  document.getElementById('cl_editBanner').style.display = 'none';
  document.getElementById('saveCliente').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar cliente';
  document.getElementById('cancelEditCliente').style.display = 'none';
  document.querySelectorAll('#sub-cliente .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}

// ---------------------------------------------------------------
// LOCAL
// ---------------------------------------------------------------

function refreshLocalClienteOptions(){
  const sel = document.getElementById('lc_cliente');
  const clientes = [...DB.Clientes].sort((a,b)=>(a['Cliente']||'').localeCompare(b['Cliente']||''));
  sel.innerHTML = `<option value="">Selecione o cliente</option>` + clientes.map(c=>`<option value="${c['ID Cliente']}">${escapeHtml(c['Cliente'])} (${c['ID Cliente']})</option>`).join('');
}

function startEditLocal(localId){
  const local = DB.Locais.find(l=>l['ID Local']===localId);
  if(!local) return;
  editingLocalId = localId;

  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector('.nav-item[data-view="cadastro"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-cadastro').classList.add('active');
  document.querySelectorAll('.subform-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.subform-tab[data-sub="local"]').classList.add('active');
  ['equipamento','cliente','local'].forEach(k=>{
    document.getElementById('sub-'+k).style.display = (k==='local') ? 'block' : 'none';
  });

  refreshLocalClienteOptions();
  document.getElementById('lc_cliente').value = local['ID Cliente'];
  document.getElementById('lc_cliente').disabled = true;
  document.getElementById('lc_nome').value = local['Nome do Local'] || '';
  document.getElementById('lc_cidade').value = local['Cidade/Região'] || '';
  document.getElementById('lc_uf').value = local['UF'] || 'SP';
  document.getElementById('lc_end').value = local['Endereço / Referência'] || '';
  document.getElementById('lc_status').value = local['Status'] || 'Online';
  document.getElementById('lc_obs').value = local['Observações'] || '';

  const banner = document.getElementById('lc_editBanner');
  banner.innerHTML = `<i class="ti ti-pencil"></i> Editando o local ${escapeHtml(localId)}`;
  banner.style.display = 'flex';
  document.getElementById('saveLocal').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar alterações';
  document.getElementById('cancelEditLocal').style.display = 'inline-flex';

  window.scrollTo({top:0, behavior:'smooth'});
}

function cancelEditLocal(){
  resetLocalForm();
}

async function saveLocalForm(){
  const nome = document.getElementById('lc_nome').value.trim();
  let valid = true;

  if(!editingLocalId){
    const clienteId = document.getElementById('lc_cliente').value;
    fieldError(document.getElementById('lc_cliente'), !clienteId); if(!clienteId) valid=false;
  }
  fieldError(document.getElementById('lc_nome'), !nome); if(!nome) valid=false;
  if(!valid){ showToast('Preencha os campos obrigatórios destacados.','ti-alert-triangle'); return; }

  const patch = {
    'Nome do Local': nome,
    'Cidade/Região': document.getElementById('lc_cidade').value.trim(),
    'UF': document.getElementById('lc_uf').value,
    'Endereço / Referência': document.getElementById('lc_end').value.trim(),
    'Status': document.getElementById('lc_status').value || 'Online',
    'Observações': document.getElementById('lc_obs').value.trim(),
  };

  try{
    if(editingLocalId){
      await dbUpdate('locais', editingLocalId, patch);
      const local = DB.Locais.find(l=>l['ID Local']===editingLocalId);
      Object.assign(local, patch);
      showToast(`Local ${editingLocalId} atualizado com sucesso.`);
    } else {
      const clienteId = document.getElementById('lc_cliente').value;
      const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
      const id = nextId('LOC', DB.Locais, 'ID Local');
      const novoLocal = Object.assign({
        'ID Local': id, 'ID Cliente': clienteId, 'Nome Cliente': cliente['Cliente'],
        'Qtde Equipamentos': 0, 'Qtde Câmeras': 0, 'Validação': 'OK'
      }, patch);
      const saved = await dbInsert('locais', novoLocal);
      DB.Locais.push(saved);

      const novaQtdeLocais = DB.Locais.filter(l=>l['ID Cliente']===clienteId).length;
      await dbUpdate('clientes', clienteId, {'Qtde Locais': novaQtdeLocais});
      cliente['Qtde Locais'] = novaQtdeLocais;

      showToast(`Local ${id} cadastrado com sucesso.`);
    }
    resetLocalForm();
    renderSidebarStats();
    refreshEquipClienteOptions();
  }catch(err){
    showToast('Não foi possível salvar no banco. Verifique sua conexão.', 'ti-alert-triangle');
  }
}

function resetLocalForm(){
  editingLocalId = null;
  document.getElementById('lc_cliente').disabled = false;
  ['lc_nome','lc_cidade','lc_end','lc_obs'].forEach(id=> document.getElementById(id).value='');
  document.getElementById('lc_cliente').value='';
  document.getElementById('lc_uf').value='SP';
  document.getElementById('lc_status').value='Online';
  document.getElementById('lc_editBanner').style.display = 'none';
  document.getElementById('saveLocal').innerHTML = '<i class="ti ti-device-floppy"></i> Salvar local';
  document.getElementById('cancelEditLocal').style.display = 'none';
  document.querySelectorAll('#sub-local .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}
