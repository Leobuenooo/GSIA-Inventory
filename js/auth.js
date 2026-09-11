// Autenticação via Supabase Auth.
//
// Não existe cadastro público — as contas são criadas manualmente pelo
// administrador no painel do Supabase (Authentication → Users → Add user).
// Sem uma conta já criada lá, ninguém consegue entrar aqui.

async function checkSession(){
  const client = getClient();
  const { data, error } = await client.auth.getSession();
  if(error){
    console.error('Erro ao verificar sessão', error);
    return null;
  }
  return data.session;
}

async function signIn(email, password){
  const client = getClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if(error) throw error;
  return data.session;
}

async function signOut(){
  const client = getClient();
  await client.auth.signOut();
  window.location.reload();
}

function showLoginScreen(){
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appRoot').style.display = 'none';
}

function hideLoginScreen(){
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appRoot').style.display = 'flex';
}

function loginErrorMessage(err){
  const msg = (err && err.message) || '';
  if(msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if(msg.includes('Email not confirmed')) return 'Essa conta ainda não foi confirmada. Fale com o administrador.';
  return 'Não foi possível entrar. Tente novamente em instantes.';
}

async function handleLoginSubmit(){
  const email = document.getElementById('login_email').value.trim();
  const password = document.getElementById('login_password').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';

  if(!email || !password){
    errEl.textContent = 'Preencha e-mail e senha.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try{
    await signIn(email, password);
    hideLoginScreen();
    await startApp();
  }catch(err){
    errEl.textContent = loginErrorMessage(err);
    errEl.style.display = 'block';
  }finally{
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

function setupAuthUI(){
  document.getElementById('loginBtn').addEventListener('click', handleLoginSubmit);
  ['login_email','login_password'].forEach(id=>{
    document.getElementById(id).addEventListener('keydown', (e)=>{
      if(e.key === 'Enter') handleLoginSubmit();
    });
  });
  document.getElementById('logoutBtn').addEventListener('click', signOut);
}
