// Funções utilitárias usadas em toda a aplicação.

function statusClass(status){
  if(!status) return 'st-nao-verificado';
  const s = String(status).toLowerCase();
  if(s.includes('online')) return 'st-online';
  if(s.includes('offline')) return 'st-offline';
  if(s.includes('manuten')) return 'st-manutencao';
  if(s.includes('desativ')) return 'st-desativado';
  if(s.includes('inativ')) return 'st-inativo';
  if(s.includes('ativo')) return 'st-online'; // "Ativo" (status de cliente) = mesmo verde do "Online"
  return 'st-nao-verificado';
}

function badge(status){
  const label = status || 'Não verificado';
  return `<span class="badge ${statusClass(status)}"><span class="dot"></span>${escapeHtml(label)}</span>`;
}

function escapeHtml(str){
  if(str===null||str===undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function showToast(msg, icon){
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.querySelector('i').className = 'ti ' + (icon || 'ti-circle-check');
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=> t.classList.remove('show'), 3200);
}

function fillSelect(el, options, placeholder){
  el.innerHTML = '';
  if(placeholder){
    const o = document.createElement('option');
    o.value=''; o.textContent = placeholder;
    el.appendChild(o);
  }
  options.forEach(v=>{
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    el.appendChild(o);
  });
}

// Gera o próximo ID sequencial de um prefixo (ex: CLI001, CLI002...).
function nextId(prefix, list, idField){
  let max = 0;
  list.forEach(r=>{
    const id = r[idField] || '';
    const m = id.match(new RegExp('^'+prefix+'(\\d+)$'));
    if(m) max = Math.max(max, parseInt(m[1],10));
  });
  const num = String(max+1).padStart(3,'0');
  return prefix + num;
}

// Converte um índice em sufixo alfabético (0->A, 1->B, ..., 25->Z, 26->AA...).
function letterSuffix(n){
  let s = '';
  n = n + 1;
  while(n > 0){
    let rem = (n-1) % 26;
    s = String.fromCharCode(65+rem) + s;
    n = Math.floor((n-1)/26);
  }
  return s;
}

// Gera o próximo ID "filho" dentro de um pai (ex: próximo EQP dentro de um LOC).
function nextChildId(baseId, list, idField, parentField, parentId){
  const siblings = list.filter(r => r[parentField] === parentId);
  const count = siblings.length;
  return baseId + letterSuffix(count);
}

function setupPasswordToggle(inputId, btnId){
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  btn.addEventListener('click', ()=>{
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.querySelector('i').className = showing ? 'ti ti-eye' : 'ti ti-eye-off';
  });
}
