// Login handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    try {
      const response = await fetch('api/auth_login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        loginMsg.textContent = 'Login bem-sucedido! Redirecionando...';
        loginMsg.className = 'msg success';
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        loginMsg.textContent = data.message || 'Credenciais inválidas';
        loginMsg.className = 'msg error';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginMsg.textContent = 'Erro ao conectar com o servidor';
      loginMsg.className = 'msg error';
    }
  });

  // Clear error message on input
  const inputs = loginForm.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (loginMsg.style.display !== 'none') {
        loginMsg.style.display = 'none';
      }
    });
  });
});
