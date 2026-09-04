// Formulários de cadastro: equipamento (+ câmeras), cliente e local.

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
  sel.innerHTML = `<option value="">Selecione o local</option>` +
    locais.map(l=>`<option value="${l['ID Local']}">${escapeHtml(l['Nome do Local'])}</option>`).join('') +
    `<option value="__novo__">+ Cadastrar novo local</option>`;
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

function saveEquipamento(){
  const clienteId = document.getElementById('eq_cliente').value;
  let localSel = document.getElementById('eq_local').value;
  const tipo = document.getElementById('eq_tipo').value;
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
    DB.Locais.push(localObj);
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
  DB.Equipamentos.push(equip);

  const camRows = document.querySelectorAll('#camRows .cam-row');
  let camCount = 0;
  camRows.forEach(row=>{
    const nome = row.querySelector('.cr-nome').value.trim();
    const canal = row.querySelector('.cr-canal').value;
    if(!nome && !canal) return;
    const camId = nextChildId('CAM', DB.Cameras, 'ID Câmera', 'ID Equipamento', equipId);
    DB.Cameras.push({
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
    camCount++;
  });
  equip['Câmeras Cadastradas'] = camCount;

  localObj['Qtde Equipamentos'] = DB.Equipamentos.filter(e=>e['ID Local']===localId).length;
  localObj['Qtde Câmeras'] = DB.Cameras.filter(c=>c['ID Local']===localId).length;
  cliente['Qtde Locais'] = DB.Locais.filter(l=>l['ID Cliente']===clienteId).length;
  cliente['Qtde Equipamentos'] = DB.Equipamentos.filter(e=>e['ID Cliente']===clienteId).length;
  cliente['Qtde Câmeras'] = DB.Cameras.filter(c=>c['ID Cliente']===clienteId).length;

  persist('Locais'); persist('Equipamentos'); persist('Cameras'); persist('Clientes');
  showToast(`Equipamento ${equipId} cadastrado com sucesso.`);
  resetEquipForm();
  renderSidebarStats();
}

function resetEquipForm(){
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
  document.querySelectorAll('#sub-equipamento .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}

function saveClienteForm(){
  const nome = document.getElementById('cl_nome').value.trim();
  const empresa = document.getElementById('cl_empresa').value.trim();
  const cidade = document.getElementById('cl_cidade').value.trim();
  let valid = true;
  fieldError(document.getElementById('cl_nome'), !nome); if(!nome) valid=false;
  fieldError(document.getElementById('cl_empresa'), !empresa); if(!empresa) valid=false;
  fieldError(document.getElementById('cl_cidade'), !cidade); if(!cidade) valid=false;
  if(!valid){ showToast('Preencha os campos obrigatórios destacados.','ti-alert-triangle'); return; }

  const id = nextId('CLI', DB.Clientes, 'ID Cliente');
  DB.Clientes.push({
    'Empresa responsável': empresa, 'ID Cliente': id, 'Cliente': nome,
    'Segmento': document.getElementById('cl_segmento').value,
    'Cidade': cidade, 'UF': document.getElementById('cl_uf').value,
    'Endereço': document.getElementById('cl_endereco').value.trim(),
    'Responsável': document.getElementById('cl_responsavel').value.trim(),
    'Telefone': document.getElementById('cl_telefone').value.trim(),
    'E-mail': document.getElementById('cl_email').value.trim(),
    'Status': document.getElementById('cl_status').value || 'Ativo',
    'Observações': document.getElementById('cl_obs').value.trim(),
    'Qtde Locais': 0, 'Qtde Equipamentos': 0, 'Qtde Câmeras': 0, 'Validação': 'OK'
  });
  persist('Clientes');
  showToast(`Cliente ${id} cadastrado com sucesso.`);
  resetClienteForm();
  renderSidebarStats();
  refreshEquipClienteOptions();
  refreshLocalClienteOptions();
}

function resetClienteForm(){
  ['cl_empresa','cl_nome','cl_cidade','cl_endereco','cl_responsavel','cl_telefone','cl_email','cl_obs']
    .forEach(id=> document.getElementById(id).value='');
  document.getElementById('cl_segmento').value='';
  document.getElementById('cl_uf').value='SP';
  document.getElementById('cl_status').value='Ativo';
  document.querySelectorAll('#sub-cliente .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}

function refreshLocalClienteOptions(){
  const sel = document.getElementById('lc_cliente');
  const clientes = [...DB.Clientes].sort((a,b)=>(a['Cliente']||'').localeCompare(b['Cliente']||''));
  sel.innerHTML = `<option value="">Selecione o cliente</option>` + clientes.map(c=>`<option value="${c['ID Cliente']}">${escapeHtml(c['Cliente'])} (${c['ID Cliente']})</option>`).join('');
}

function saveLocalForm(){
  const clienteId = document.getElementById('lc_cliente').value;
  const nome = document.getElementById('lc_nome').value.trim();
  let valid = true;
  fieldError(document.getElementById('lc_cliente'), !clienteId); if(!clienteId) valid=false;
  fieldError(document.getElementById('lc_nome'), !nome); if(!nome) valid=false;
  if(!valid){ showToast('Preencha os campos obrigatórios destacados.','ti-alert-triangle'); return; }

  const cliente = DB.Clientes.find(c=>c['ID Cliente']===clienteId);
  const id = nextId('LOC', DB.Locais, 'ID Local');
  DB.Locais.push({
    'ID Local': id, 'ID Cliente': clienteId, 'Nome Cliente': cliente['Cliente'],
    'Nome do Local': nome,
    'Cidade/Região': document.getElementById('lc_cidade').value.trim(),
    'UF': document.getElementById('lc_uf').value,
    'Endereço / Referência': document.getElementById('lc_end').value.trim(),
    'Qtde Equipamentos': 0, 'Qtde Câmeras': 0,
    'Status': document.getElementById('lc_status').value || 'Online',
    'Observações': document.getElementById('lc_obs').value.trim(),
    'Validação': 'OK'
  });
  cliente['Qtde Locais'] = DB.Locais.filter(l=>l['ID Cliente']===clienteId).length;

  persist('Locais'); persist('Clientes');
  showToast(`Local ${id} cadastrado com sucesso.`);
  resetLocalForm();
  renderSidebarStats();
  refreshEquipClienteOptions();
}

function resetLocalForm(){
  ['lc_nome','lc_cidade','lc_end','lc_obs'].forEach(id=> document.getElementById(id).value='');
  document.getElementById('lc_cliente').value='';
  document.getElementById('lc_uf').value='SP';
  document.getElementById('lc_status').value='Online';
  document.querySelectorAll('#sub-local .field.error').forEach(f=>{
    f.classList.remove('error');
    const e = f.querySelector('.err-text'); if(e) e.remove();
  });
}
