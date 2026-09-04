// Ponto de entrada da aplicação. Roda depois de todos os outros módulos
// terem sido carregados (ver ordem dos <script> no index.html).

function boot(){
  initDB();
  renderSidebarStats();
  renderClientList();
  setupNav();
  setupFormPopulation();
  document.getElementById('searchInput').addEventListener('input', renderClientList);
}

boot();
