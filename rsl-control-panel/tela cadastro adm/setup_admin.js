// Script temporário para criação de admin inicial
async function createAdmin(payload){
  const r = await fetch('api/adm_setup_create.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j = await r.json();
  if(!j.success) throw new Error(j.message||'Erro');
  return j;
}

function setMsg(m,err){
  const el=document.getElementById('msg');
  el.textContent=m; el.style.color=err?'#e54848':'#8fe6ac';
}

document.getElementById('setupForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;
  const secret = document.getElementById('secret').value.trim();
  if(password!==password2){ setMsg('Senhas não conferem',true); return; }
  if(password.length<10 || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(password)){
    setMsg('Senha fraca: min 10, número e símbolo',true); return;
  }
  setMsg('Criando...');
  try {
    const res = await createAdmin({name,email,password,secret});
    setMsg('Criado com sucesso (id '+res.admin.id+'). APAGUE esta tela.',false);
    document.getElementById('testLoginBtn').style.display='inline-flex';
  } catch(err){
    setMsg(err.message,true);
  }
});
