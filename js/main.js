// Ponto de entrada da aplicação. Roda depois de todos os outros módulos
// terem sido carregados (ver ordem dos <script> no index.html).
//
// Como initDB() agora busca os dados no Supabase pela rede, a inicialização
// é assíncrona: mostramos um estado de carregamento e, se a conexão falhar
// (ex: credenciais não preenchidas em js/config.js, ou sem internet),
// mostramos uma mensagem de erro em vez de uma tela em branco.

function showBootLoading(){
  document.getElementById('clientList').innerHTML = `
    <div class="boot-state">
      <i class="ti ti-loader-2"></i>
      <h3>Carregando dados do Supabase...</h3>
      <p>Isso leva só um instante.</p>
    </div>`;
}

function showBootError(){
  document.getElementById('clientList').innerHTML = `
    <div class="boot-state error">
      <i class="ti ti-plug-connected-x"></i>
      <h3>Não foi possível carregar os dados</h3>
      <p>Confira se o arquivo <b>js/config.js</b> já tem a URL e a chave "anon" do seu projeto Supabase preenchidas, e se as tabelas foram criadas com os scripts em <b>supabase/</b>.</p>
      <span class="mono">Veja o console do navegador (F12) para o erro técnico completo.</span>
    </div>`;
}

async function boot(){
  showBootLoading();
  const ok = await initDB();
  if(!ok){
    showBootError();
    return;
  }
  renderSidebarStats();
  renderClientList();
  setupNav();
  setupFormPopulation();
  document.getElementById('searchInput').addEventListener('input', renderClientList);
}

boot();
