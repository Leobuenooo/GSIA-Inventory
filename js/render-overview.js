// Painel de visão geral: estatísticas agregadas do inventário.

function renderOverview(){
  const totalClientes = DB.Clientes.length;
  const clientesAtivos = DB.Clientes.filter(c=> (c['Status']||'').toLowerCase() !== 'inativo').length;
  const totalEquip = DB.Equipamentos.length;
  const totalCam = DB.Cameras.length;

  const statusCount = {};
  DB.Equipamentos.forEach(e=>{
    const s = e['Status'] || 'Não verificado';
    statusCount[s] = (statusCount[s]||0)+1;
  });
  const camStatusCount = {};
  DB.Cameras.forEach(c=>{
    const s = c['Status'] || 'Não verificado';
    camStatusCount[s] = (camStatusCount[s]||0)+1;
  });
  const segCount = {};
  DB.Clientes.forEach(c=>{
    const s = c['Segmento'] || 'Outro';
    segCount[s] = (segCount[s]||0)+1;
  });

  function barList(counts, total){
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([label,val])=>`
      <div class="ov-row">
        <div class="ov-label">${escapeHtml(label)}</div>
        <div class="ov-bar-track"><div class="ov-bar-fill" style="width:${Math.round(val/total*100)}%"></div></div>
        <div class="ov-val">${val}</div>
      </div>
    `).join('');
  }

  document.getElementById('overviewContent').innerHTML = `
    <div class="grid stat-grid">
      <div class="stat-card"><p class="stat-label">Clientes</p><p class="stat-value">${totalClientes}</p></div>
      <div class="stat-card"><p class="stat-label">Clientes ativos</p><p class="stat-value green">${clientesAtivos}</p></div>
      <div class="stat-card"><p class="stat-label">Equipamentos</p><p class="stat-value">${totalEquip}</p></div>
      <div class="stat-card"><p class="stat-label">Câmeras</p><p class="stat-value">${totalCam}</p></div>
    </div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
      <div class="card">
        <div class="form-section-title" style="border:none;margin-bottom:14px;"><i class="ti ti-device-cctv"></i>Equipamentos por status</div>
        <div class="overview-list">${barList(statusCount, totalEquip)}</div>
      </div>
      <div class="card">
        <div class="form-section-title" style="border:none;margin-bottom:14px;"><i class="ti ti-camera"></i>Câmeras por status</div>
        <div class="overview-list">${barList(camStatusCount, totalCam)}</div>
      </div>
    </div>
    <div class="card" style="margin-top:16px;">
      <div class="form-section-title" style="border:none;margin-bottom:14px;"><i class="ti ti-building"></i>Clientes por segmento</div>
      <div class="overview-list">${barList(segCount, totalClientes)}</div>
    </div>
  `;
}
