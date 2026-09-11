// Ponto de entrada da aplicação. Roda depois de todos os outros módulos
// terem sido carregados (ver ordem dos <script> no index.html).
//
// Fluxo: primeiro verifica se já existe uma sessão de login válida
// (o supabase-js guarda isso automaticamente no navegador). Se não
// houver, mostra a tela de login e só carrega os dados depois que o
// login der certo.

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

// Carrega os dados e liga a interface — só é chamado depois de confirmado o login.
async function startApp(){
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

async function boot(){
  setupAuthUI();
  const session = await checkSession();
  if(session){
    hideLoginScreen();
    await startApp();
  } else {
    showLoginScreen();
  }
}

boot();
