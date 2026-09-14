// Navegação entre telas (sidebar + sub-abas de cadastro) e preenchimento
// inicial dos selects dos formulários.

// Troca a tela principal ativa (sidebar). Reaproveitada tanto pelo clique
// no menu quanto pelo "voltar pra pesquisa depois de editar" (forms.js).
function goToView(viewName){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if(navItem) navItem.classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+viewName).classList.add('active');
  if(viewName === 'overview') renderOverview();
}

// Depois de salvar ou cancelar uma edição, volta pra tela de onde a
// edição foi iniciada (a pesquisa), reabrindo o cliente que estava
// aberto. Sem isso, editar algo "sequestra" a navegação pra tela de
// cadastro e a pessoa perde o lugar onde estava.
function returnToPesquisaAposEdicao(){
  goToView('pesquisar');
  if(currentClientId) openClientDetail(currentClientId);
}

function setupNav(){
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      // Se a pessoa sair da tela de cadastro no meio de uma edição sem
      // salvar nem cancelar explicitamente, descarta a edição em
      // andamento — evita deixar campos desabilitados/formulário "preso"
      // num estado de edição escondido para a próxima vez que ela voltar.
      if(item.dataset.view !== 'cadastro'){
        if(editingClienteId) resetClienteForm();
        if(editingLocalId) resetLocalForm();
        if(editingEquipId) resetEquipForm();
      }
      goToView(item.dataset.view);
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
  fillSelect(document.getElementById('cl_plano'), LISTAS.plano, 'Selecione o plano');
  fillSelect(document.getElementById('cl_uf'), LISTAS.uf);
  document.getElementById('cl_uf').value='SP';
  fillSelect(document.getElementById('cl_status'), ['Ativo','Inativo']);

  fillSelect(document.getElementById('lc_uf'), LISTAS.uf);
  document.getElementById('lc_uf').value='SP';
  fillSelect(document.getElementById('lc_status'), LISTAS.status);

  refreshEquipClienteOptions();
  refreshEquipLocalOptions();
  refreshLocalClienteOptions();

  document.getElementById('eq_cliente').addEventListener('change', refreshEquipLocalOptions);
  document.getElementById('eq_local').addEventListener('change', (e)=>{
    document.getElementById('eq_novolocal_fields').style.display = e.target.value === '__novo__' ? 'grid' : 'none';
  });

  document.getElementById('addCamRow').addEventListener('click', ()=> addCamRow());
  addCamRow();

  setupPasswordToggle('eq_pass', 'eq_pass_toggle');

  document.getElementById('saveEquip').addEventListener('click', saveEquipamento);
  document.getElementById('clearEquip').addEventListener('click', resetEquipForm);
  document.getElementById('cancelEditEquip').addEventListener('click', cancelEditEquip);
  document.getElementById('saveCliente').addEventListener('click', saveClienteForm);
  document.getElementById('clearCliente').addEventListener('click', resetClienteForm);
  document.getElementById('cancelEditCliente').addEventListener('click', cancelEditCliente);
  document.getElementById('saveLocal').addEventListener('click', saveLocalForm);
  document.getElementById('clearLocal').addEventListener('click', resetLocalForm);
  document.getElementById('cancelEditLocal').addEventListener('click', cancelEditLocal);
}
