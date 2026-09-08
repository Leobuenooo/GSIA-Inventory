// Pesquisa de clientes e detalhamento (cliente → locais → equipamentos → câmeras).
// Inclui os botões de editar/excluir de cada nível e a edição inline das câmeras.

function renderSidebarStats(){
  const totalClientes = DB.Clientes.length;
  const totalEquip = DB.Equipamentos.length;
  const totalCam = DB.Cameras.length;
  document.getElementById('sidebarStats').innerHTML = `
    <div class="sidebar-stat-row"><span>Clientes</span><b>${totalClientes}</b></div>
    <div class="sidebar-stat-row"><span>Equipamentos</span><b>${totalEquip}</b></div>
    <div class="sidebar-stat-row"><span>Câmeras</span><b>${totalCam}</b></div>
  `;
}

function matchesQuery(cliente, q){
  if(!q) return true;
  q = q.toLowerCase();
  const fields = [cliente['Cliente'], cliente['ID Cliente'], cliente['Cidade'], cliente['Segmento'], cliente['Empresa responsável']];
  if(fields.some(f => f && String(f).toLowerCase().includes(q))) return true;
  const equips = DB.Equipamentos.filter(e=> e['ID Cliente']===cliente['ID Cliente']);
  if(equips.some(e => (e['ID Equipamento']||'').toLowerCase().includes(q) || (e['Nome no SIMNEXT/D-GUARD']||'').toLowerCase().includes(q) || (e['Modelo']||'').toLowerCase().includes(q))) return true;
  const cams = DB.Cameras.filter(c => c['ID Cliente']===cliente['ID Cliente']);
  if(cams.some(c => (c['ID Câmera']||'').toLowerCase().includes(q) || (c['Nome no Sistema']||'').toLowerCase().includes(q))) return true;
  return false;
}

function renderClientList(){
  const q = document.getElementById('searchInput').value.trim();
  const results = DB.Clientes.filter(c => matchesQuery(c, q))
    .sort((a,b)=> (a['Cliente']||'').localeCompare(b['Cliente']||''));

  document.getElementById('searchResultsInfo').textContent = q
    ? `${results.length} cliente(s) encontrado(s) para "${q}"`
    : `${results.length} clientes cadastrados`;

  const listEl = document.getElementById('clientList');
  if(results.length === 0){
    listEl.innerHTML = `<div class="empty-state"><i class="ti ti-search-off"></i>Nenhum cliente encontrado. Tente outro termo de busca.</div>`;
    return;
  }
  listEl.innerHTML = results.map(c => {
    const equipCount = DB.Equipamentos.filter(e=>e['ID Cliente']===c['ID Cliente']).length;
    const camCount = DB.Cameras.filter(cm=>cm['ID Cliente']===c['ID Cliente']).length;
    const locCount = DB.Locais.filter(l=>l['ID Cliente']===c['ID Cliente']).length;
    return `
    <div class="client-card" data-id="${c['ID Cliente']}">
      <div class="client-card-top">
        <div>
          <p class="client-name">${escapeHtml(c['Cliente'])}</p>
          <p class="client-meta">${escapeHtml(c['ID Cliente'])} · ${escapeHtml(c['Cidade']||'—')}/${escapeHtml(c['UF']||'')} · ${escapeHtml(c['Empresa responsável']||'—')}</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${c['Segmento'] ? `<span class="badge seg">${escapeHtml(c['Segmento'])}</span>` : ''}
          ${badge(c['Status'] || 'Ativo')}
        </div>
      </div>
      <div class="client-counts">
        <div class="count-item"><b>${locCount}</b> local(is)</div>
        <div class="count-item"><b>${equipCount}</b> equipamento(s)</div>
        <div class="count-item"><b>${camCount}</b> câmera(s)</div>
      </div>
    </div>`;
  }).join('');

  listEl.querySelectorAll('.client-card').forEach(card=>{
    card.addEventListener('click', ()=> openClientDetail(card.dataset.id));
  });
}

// ---- linha de câmera: modo visualização x modo edição inline ----

function camRowViewHTML(cm){
  return `
    <td class="mono">${escapeHtml(cm['Canal']||'—')}</td>
    <td>${escapeHtml(cm['Nome no Sistema']||'—')}</td>
    <td>${escapeHtml(cm['Tecnologia']||'—')}</td>
    <td class="mono">${escapeHtml(cm['IP da câmera (se disponível)']||'—')}</td>
    <td>${escapeHtml(cm['Posição / Área']||'—')}</td>
    <td>${badge(cm['Status']||'Online')}</td>
    <td>
      <div class="row-actions">
        <button class="icon-btn accent cam-edit-btn" title="Editar câmera" type="button"><i class="ti ti-pencil"></i></button>
        <button class="icon-btn danger cam-delete-btn" title="Excluir câmera" type="button"><i class="ti ti-trash"></i></button>
      </div>
    </td>`;
}

function camRowEditHTML(cm){
  const techOptions = LISTAS.tecnologiaCamera.map(t=>`<option value="${t}" ${cm['Tecnologia']===t?'selected':''}>${t}</option>`).join('');
  const statusOptions = LISTAS.status.map(s=>`<option value="${s}" ${cm['Status']===s?'selected':''}>${s}</option>`).join('');
  return `
    <td class="cam-inline-edit"><input type="number" min="1" class="ic-canal" value="${escapeHtml(cm['Canal']||'')}"></td>
    <td class="cam-inline-edit"><input type="text" class="ic-nome" value="${escapeHtml(cm['Nome no Sistema']||'')}"></td>
    <td class="cam-inline-edit"><select class="ic-tech"><option value="">—</option>${techOptions}</select></td>
    <td class="cam-inline-edit"><input type="text" class="ic-ip" value="${escapeHtml(cm['IP da câmera (se disponível)']||'')}"></td>
    <td class="cam-inline-edit"><input type="text" class="ic-pos" value="${escapeHtml(cm['Posição / Área']||'')}"></td>
    <td class="cam-inline-edit"><select class="ic-status">${statusOptions}</select></td>
    <td>
      <div class="row-actions">
        <button class="icon-btn accent cam-save-btn" title="Salvar" type="button"><i class="ti ti-check"></i></button>
        <button class="icon-btn cam-cancel-btn" title="Cancelar" type="button"><i class="ti ti-x"></i></button>
      </div>
    </td>`;
}

function wireCamRow(tr, camId){
  tr.querySelector('.cam-edit-btn').addEventListener('click', ()=>{
    const cam = DB.Cameras.find(c=>c['ID Câmera']===camId);
    tr.innerHTML = camRowEditHTML(cam);
    wireCamRow(tr, camId);
  });
  tr.querySelector('.cam-delete-btn')?.addEventListener('click', ()=> deleteCamera(camId));
  tr.querySelector('.cam-save-btn')?.addEventListener('click', ()=> saveInlineCamera(camId, tr));
  tr.querySelector('.cam-cancel-btn')?.addEventListener('click', ()=>{
    const cam = DB.Cameras.find(c=>c['ID Câmera']===camId);
    tr.innerHTML = camRowViewHTML(cam);
    wireCamRow(tr, camId);
  });
}

function openClientDetail(clienteId){
  currentClientId = clienteId;
  const c = DB.Clientes.find(x=>x['ID Cliente']===clienteId);
  if(!c) return;
  document.getElementById('clientList').style.display = 'none';
  document.querySelector('.searchbar').style.display = 'none';
  document.getElementById('searchResultsInfo').style.display = 'none';
  const detail = document.getElementById('clientDetail');
  detail.style.display = 'block';

  const locais = DB.Locais.filter(l=>l['ID Cliente']===clienteId);
  const equipCount = DB.Equipamentos.filter(e=>e['ID Cliente']===clienteId).length;
  const camCount = DB.Cameras.filter(cm=>cm['ID Cliente']===clienteId).length;

  let html = `
    <div class="detail-back" id="backToList"><i class="ti ti-arrow-left"></i> Voltar à pesquisa</div>
    <div class="card">
      <div class="detail-header">
        <div>
          <p class="detail-title">${escapeHtml(c['Cliente'])}</p>
          <p class="page-sub">${escapeHtml(c['ID Cliente'])} · ${escapeHtml(c['Empresa responsável']||'—')}</p>
        </div>
        <div class="header-actions">
          ${c['Segmento'] ? `<span class="badge seg">${escapeHtml(c['Segmento'])}</span>` : ''}
          ${badge(c['Status']||'Ativo')}
          <button class="icon-btn accent" id="editClienteBtn" title="Editar cliente"><i class="ti ti-pencil"></i></button>
          <button class="icon-btn danger" id="deleteClienteBtn" title="Excluir cliente"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="lbl">Cidade/UF</div><div class="val">${escapeHtml(c['Cidade']||'—')} / ${escapeHtml(c['UF']||'—')}</div></div>
        <div class="info-item"><div class="lbl">Endereço</div><div class="val">${escapeHtml(c['Endereço']||'—')}</div></div>
        <div class="info-item"><div class="lbl">Responsável</div><div class="val">${escapeHtml(c['Responsável']||'—')}</div></div>
        <div class="info-item"><div class="lbl">Telefone</div><div class="val">${escapeHtml(c['Telefone']||'—')}</div></div>
        <div class="info-item"><div class="lbl">E-mail</div><div class="val">${escapeHtml(c['E-mail']||'—')}</div></div>
        <div class="info-item"><div class="lbl">Locais / Equip. / Câmeras</div><div class="val">${locais.length} / ${equipCount} / ${camCount}</div></div>
      </div>
      ${c['Observações'] ? `<div class="info-item" style="margin-top:12px;"><div class="lbl">Observações</div><div class="val">${escapeHtml(c['Observações'])}</div></div>` : ''}
    </div>

    <div class="section-label"><i class="ti ti-map-pin"></i>Locais (${locais.length})</div>
  `;

  if(locais.length===0){
    html += `<div class="empty-state"><i class="ti ti-map-pin-off"></i>Nenhum local cadastrado para este cliente.</div>`;
  } else {
    locais.forEach(local=>{
      const equipamentos = DB.Equipamentos.filter(e=>e['ID Local']===local['ID Local']);
      html += `
      <div class="local-block">
        <div class="local-head" data-local="${local['ID Local']}">
          <div>
            <div class="local-head-title">${escapeHtml(local['Nome do Local'])}</div>
            <div class="local-head-sub">${escapeHtml(local['Cidade/Região']||'—')} · ${equipamentos.length} equipamento(s) · ${badge(local['Status']||'Ativo')}</div>
          </div>
          <div class="local-head-actions">
            <button class="icon-btn accent local-edit-btn" data-local-edit="${local['ID Local']}" title="Editar local"><i class="ti ti-pencil"></i></button>
            <button class="icon-btn danger local-delete-btn" data-local-delete="${local['ID Local']}" title="Excluir local"><i class="ti ti-trash"></i></button>
            <i class="ti ti-chevron-down" id="chev-${local['ID Local']}"></i>
          </div>
        </div>
        <div class="local-body" id="body-${local['ID Local']}">
      `;
      if(local['Observações']){
        html += `<div class="info-item" style="margin:10px 0;"><div class="lbl">Observações</div><div class="val">${escapeHtml(local['Observações'])}</div></div>`;
      }
      if(equipamentos.length===0){
        html += `<div class="empty-state" style="padding:20px;"><i class="ti ti-device-cctv"></i>Nenhum equipamento neste local.</div>`;
      } else {
        equipamentos.forEach(eq=>{
          const cams = DB.Cameras.filter(cm=>cm['ID Equipamento']===eq['ID Equipamento']);
          html += `
          <div class="equip-item">
            <div class="equip-top" data-equip="${eq['ID Equipamento']}">
              <div>
                <span class="equip-id">${escapeHtml(eq['ID Equipamento'])}</span>
                <span class="equip-name">${escapeHtml(eq['Nome no SIMNEXT/D-GUARD']||eq['Tipo']||'Equipamento')}</span>
                <div class="equip-sub">${escapeHtml(eq['Tipo']||'—')} · ${escapeHtml(eq['Fabricante']||'—')} ${escapeHtml(eq['Modelo']||'')} · ${cams.length} câmera(s) · ${badge(eq['Status']||'Ativo')}</div>
              </div>
              <div class="equip-actions">
                <button class="icon-btn accent equip-edit-btn" data-equip-edit="${eq['ID Equipamento']}" title="Editar equipamento"><i class="ti ti-pencil"></i></button>
                <button class="icon-btn danger equip-delete-btn" data-equip-delete="${eq['ID Equipamento']}" title="Excluir equipamento"><i class="ti ti-trash"></i></button>
                <i class="ti ti-chevron-down"></i>
              </div>
            </div>
            <div class="equip-cams" id="cams-${eq['ID Equipamento']}">
              <div class="info-grid" style="margin:10px 0 12px;">
                <div class="info-item"><div class="lbl">IP local</div><div class="val mono">${escapeHtml(eq['IPv4 Local']||'—')}</div></div>
                <div class="info-item"><div class="lbl">MAC</div><div class="val mono">${escapeHtml(eq['MAC']||'—')}</div></div>
                <div class="info-item"><div class="lbl">Cloud ID / Domínio</div><div class="val mono">${escapeHtml(eq['Cloud ID / Domínio']||'—')}</div></div>
                <div class="info-item"><div class="lbl">Canais</div><div class="val">${escapeHtml(eq['Qtde Canais']||'—')}</div></div>
                <div class="info-item"><div class="lbl">Usuário</div><div class="val mono">${escapeHtml(eq['Usuário']||'—')}</div></div>
                <div class="info-item"><div class="lbl">Origem</div><div class="val">${escapeHtml(eq['Origem da Informação']||'—')}</div></div>
              </div>
              ${eq['Observações'] ? `<div class="info-item" style="margin-bottom:10px;"><div class="lbl">Observações</div><div class="val">${escapeHtml(eq['Observações'])}</div></div>`:''}
              ${cams.length ? `
              <table>
                <thead><tr><th>Canal</th><th>Nome</th><th>Tecnologia</th><th>IP</th><th>Posição</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${cams.sort((a,b)=>(a['Canal']||0)-(b['Canal']||0)).map(cm=>`
                    <tr data-cam-row="${cm['ID Câmera']}">${camRowViewHTML(cm)}</tr>
                  `).join('')}
                </tbody>
              </table>` : `<div class="empty-state" style="padding:14px;"><i class="ti ti-camera-off"></i>Nenhuma câmera cadastrada.</div>`}
            </div>
          </div>`;
        });
      }
      html += `</div></div>`;
    });
  }

  detail.innerHTML = html;
  document.getElementById('backToList').addEventListener('click', closeClientDetail);
  document.getElementById('editClienteBtn').addEventListener('click', ()=> startEditCliente(clienteId));
  document.getElementById('deleteClienteBtn').addEventListener('click', ()=> deleteCliente(clienteId));

  detail.querySelectorAll('.local-head').forEach(h=>{
    h.addEventListener('click', (evt)=>{
      if(evt.target.closest('.local-edit-btn') || evt.target.closest('.local-delete-btn')) return;
      const id = h.dataset.local;
      document.getElementById('body-'+id).classList.toggle('open');
      const chev = document.getElementById('chev-'+id);
      chev.style.transform = document.getElementById('body-'+id).classList.contains('open') ? 'rotate(180deg)' : '';
    });
  });
  detail.querySelectorAll('.local-edit-btn').forEach(btn=>{
    btn.addEventListener('click', (evt)=>{ evt.stopPropagation(); startEditLocal(btn.dataset.localEdit); });
  });
  detail.querySelectorAll('.local-delete-btn').forEach(btn=>{
    btn.addEventListener('click', (evt)=>{ evt.stopPropagation(); deleteLocal(btn.dataset.localDelete); });
  });

  detail.querySelectorAll('.equip-top').forEach(h=>{
    h.addEventListener('click', (evt)=>{
      if(evt.target.closest('.equip-edit-btn') || evt.target.closest('.equip-delete-btn')) return;
      const id = h.dataset.equip;
      document.getElementById('cams-'+id).classList.toggle('open');
    });
  });
  detail.querySelectorAll('.equip-edit-btn').forEach(btn=>{
    btn.addEventListener('click', (evt)=>{ evt.stopPropagation(); startEditEquipamento(btn.dataset.equipEdit); });
  });
  detail.querySelectorAll('.equip-delete-btn').forEach(btn=>{
    btn.addEventListener('click', (evt)=>{ evt.stopPropagation(); deleteEquipamento(btn.dataset.equipDelete); });
  });

  detail.querySelectorAll('tr[data-cam-row]').forEach(tr=>{
    wireCamRow(tr, tr.dataset.camRow);
  });

  const firstBody = detail.querySelector('.local-body');
  if(firstBody) firstBody.classList.add('open');
}

function closeClientDetail(){
  currentClientId = null;
  document.getElementById('clientDetail').style.display = 'none';
  document.getElementById('clientList').style.display = 'block';
  document.querySelector('.searchbar').style.display = 'flex';
  document.getElementById('searchResultsInfo').style.display = 'block';
}
