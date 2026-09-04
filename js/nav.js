// Navegação entre telas (sidebar + sub-abas de cadastro) e preenchimento
// inicial dos selects dos formulários.

function setupNav(){
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('view-'+item.dataset.view).classList.add('active');
      if(item.dataset.view === 'overview') renderOverview();
    });
  });
  document.querySelectorAll('.subform-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.subform-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      ['equipamento','cliente','local'].forEach(k=>{
        document.getElementById('sub-'+k).style.display = (k===tab.dataset.sub) ? 'block' : 'none';
      });
    });
  });
}

function setupFormPopulation(){
  fillSelect(document.getElementById('eq_tipo'), LISTAS.tipoEquipamento, 'Selecione o tipo');
  fillSelect(document.getElementById('eq_status'), LISTAS.status);
  fillSelect(document.getElementById('eq_origem'), LISTAS.origem, 'Selecione a origem');
  fillSelect(document.getElementById('eq_nl_uf'), LISTAS.uf);
  document.getElementById('eq_nl_uf').value = 'SP';

  fillSelect(document.getElementById('cl_segmento'), LISTAS.segmento, 'Selecione o segmento');
  fillSelect(document.getElementById('cl_uf'), LISTAS.uf);
  document.getElementById('cl_uf').value='SP';
  fillSelect(document.getElementById('cl_status'), ['Ativo','Inativo']);

  fillSelect(document.getElementById('lc_uf'), LISTAS.uf);
  document.getElementById('lc_uf').value='SP';
  fillSelect(document.getElementById('lc_status'), LISTAS.status);

  refreshEquipClienteOptions();
  refreshLocalClienteOptions();

  document.getElementById('eq_cliente').addEventListener('change', refreshEquipLocalOptions);
  document.getElementById('eq_local').addEventListener('change', (e)=>{
    document.getElementById('eq_novolocal_fields').style.display = e.target.value === '__novo__' ? 'grid' : 'none';
  });

  document.getElementById('addCamRow').addEventListener('click', ()=> addCamRow());
  addCamRow();

  document.getElementById('saveEquip').addEventListener('click', saveEquipamento);
  document.getElementById('clearEquip').addEventListener('click', resetEquipForm);
  document.getElementById('saveCliente').addEventListener('click', saveClienteForm);
  document.getElementById('clearCliente').addEventListener('click', resetClienteForm);
  document.getElementById('saveLocal').addEventListener('click', saveLocalForm);
  document.getElementById('clearLocal').addEventListener('click', resetLocalForm);
}
