// Login script (ADM) com fallback multi-base e diagnóstico detalhado
function computeBases(){
  const bases = [];
  const path = window.location.pathname;
  if(path.match(/\/ADM\//i)){
    bases.push('api');        // /ADM/api/* (estrutura completa)
    bases.push('../api');     // admin hospedado dentro subpasta servindo raiz /api
    bases.push('../../api');  // caso aninhamento extra
  } else {
    bases.push('ADM/api');    // raiz -> /ADM/api
    bases.push('api');
  }
  return Array.from(new Set(bases));
}
let ADM_API_BASE = null;

async function admLogin(email, password){
  const bases = computeBases();
  let lastErr;
  for(const base of bases){
    try {
      const url = base.replace(/\/$/,'') + '/auth_login.php';
      const res = await fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email,password})
      });
      const text = await res.text();
      if(res.status === 404){
        lastErr = new Error('404 em '+url);
        console.warn('[ADM LOGIN] 404 em', url);
        continue;
      }
      let data;
      try { data = JSON.parse(text); } catch(parseErr){
        console.error('[ADM LOGIN] Resposta não JSON de', url, 'status', res.status, 'body head:', text.substring(0,120));
        lastErr = new Error('Resposta não JSON em '+url+': '+text.substring(0,80));
        continue;
      }
      if(!data.success){
        lastErr = new Error(data.message||'Falha login');
        continue;
      }
      ADM_API_BASE = base; // guarda base válida
      return data;
    } catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error('Falha login');
}

(function(){
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    setMsg('loginMsg','Autenticando...');
    try {
  const r = await admLogin(email,password);
      // Store session token (httpOnly cookie assumed). Store CSRF token for requests.
  sessionStorage.setItem('ADM_USER', JSON.stringify(r.user));
  sessionStorage.setItem('ADM_CSRF', r.csrf);
  if(r.token) sessionStorage.setItem('ADM_TOKEN', r.token);
      location.href='dashboard.html';
    } catch(err){
      setMsg('loginMsg', err.message, true);
    }
  });
})();

function setMsg(id,msg,err){
  const el = document.getElementById(id); if(!el) return;
  el.textContent = msg; el.style.color = err? '#ff6b6b':'#8fe6ac';
}
