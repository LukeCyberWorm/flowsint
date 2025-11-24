# RSL Control - Central de Controle Administrativo

Painel administrativo seguro para monitoramento e gerenciamento do sistema RSL-Scarlet.

## 🎯 Funcionalidades

- **Dashboard**: Visão geral com KPIs e métricas do sistema
- **Gerenciamento de Usuários**: Visualizar, monitorar e gerenciar usuários
- **Investigações**: Acompanhar investigações ativas e histórico
- **Segurança**: Logs de login, tentativas falhas e bloqueios de IP
- **Auditoria**: Trilha completa de ações administrativas
- **Analytics**: Métricas de performance e uso do sistema

## 🚀 Instalação

### 1. Configurar Subdomínio

Configure um subdomínio (ex: `control.rsl.scarletredsolutions.com`) apontando para o VPS.

### 2. Configurar Nginx

Crie arquivo `/etc/nginx/sites-available/rsl-control.conf`:

```nginx
server {
    listen 80;
    server_name control.rsl.scarletredsolutions.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name control.rsl.scarletredsolutions.com;

    root /var/www/rsl-control;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/control.rsl.scarletredsolutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/control.rsl.scarletredsolutions.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # API routes
    location /api/ {
        try_files $uri $uri/ =404;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to sensitive files
    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

### 3. Instalar PHP e PostgreSQL

```bash
# Instalar PHP-FPM
sudo apt update
sudo apt install php8.1-fpm php8.1-pgsql php8.1-json php8.1-mbstring

# Verificar instalação
php -v
```

### 4. Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL no Docker
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint

# Executar o arquivo SQL
\i /path/to/setup_admin_tables.sql

# Ou copiar e colar o conteúdo do arquivo SQL
```

### 5. Deploy dos Arquivos

```bash
# Criar diretório
sudo mkdir -p /var/www/rsl-control

# Copiar arquivos (do seu PC Windows)
scp -r rsl-control/* root@31.97.83.205:/var/www/rsl-control/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/rsl-control
sudo find /var/www/rsl-control -type d -exec chmod 755 {} \;
sudo find /var/www/rsl-control -type f -exec chmod 644 {} \;
```

### 6. Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot se ainda não tiver
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d control.rsl.scarletredsolutions.com
```

### 7. Atualizar Configurações do PHP

Edite os arquivos PHP em `api/` e atualize as credenciais do banco:

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '5433');
define('DB_NAME', 'flowsint');
define('DB_USER', 'flowsint');
define('DB_PASS', 'SUA_SENHA_AQUI');
```

## 🔐 Segurança

### Credenciais Padrão

**⚠️ IMPORTANTE: Altere imediatamente após o primeiro login!**

- **Email**: `admin@scarletredsolutions.com`
- **Senha**: `Admin@2025`

### Alterar Senha do Admin

```sql
-- Conectar ao banco
docker exec -it flowsint-postgres-prod psql -U flowsint -d flowsint

-- Gerar novo hash (use um site ou PHP)
-- Exemplo: password_hash('NovaSenhaSegura', PASSWORD_BCRYPT)

-- Atualizar senha
UPDATE admins 
SET password_hash = '$2y$10$SEU_NOVO_HASH_AQUI' 
WHERE email = 'admin@scarletredsolutions.com';
```

### Recursos de Segurança

- ✅ Rate limiting (5 tentativas / 15 minutos)
- ✅ Session timeout (30 minutos de inatividade)
- ✅ Cookies HttpOnly e Secure
- ✅ Regeneração de Session ID após login
- ✅ Logs detalhados de tentativas de login
- ✅ Bcrypt para hash de senhas
- ✅ Proteção CSRF (implementar em produção)

## 📊 Estrutura de Arquivos

```
rsl-control/
├── index.html              # Página de login
├── dashboard.html          # Dashboard principal
├── assets/
│   ├── style.css          # Estilos (tema RSL)
│   ├── login.js           # Lógica de login
│   └── dashboard.js       # Lógica do dashboard
├── api/
│   ├── auth_login.php     # Autenticação
│   ├── auth_check.php     # Verificação de sessão
│   ├── auth_logout.php    # Logout
│   ├── dashboard_stats.php # Estatísticas do dashboard
│   └── setup_admin_tables.sql # Script de criação das tabelas
└── README.md              # Este arquivo
```

## 🛠️ Desenvolvimento

### Adicionar Novo Admin

```sql
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
    'novo@admin.com',
    '$2y$10$HASH_GERADO_AQUI',
    'Nome do Admin',
    'admin'
);
```

### Consultar Logs de Segurança

```sql
-- Últimas tentativas de login
SELECT * FROM admin_login_attempts 
ORDER BY attempt_time DESC 
LIMIT 50;

-- Eventos de segurança
SELECT * FROM security_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

## 🎨 Personalização

O design segue o tema do RSL-Scarlet:
- Cor primária: `#dc2638` (vermelho escarlate)
- Background: `#0a0a0f` (preto profundo)
- Font: Oxanium (mesma do sistema principal)

## 📝 Próximas Implementações

- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Filtros avançados nas tabelas
- [ ] Gráficos de analytics (Chart.js)
- [ ] Notificações em tempo real
- [ ] 2FA (autenticação de dois fatores)
- [ ] Gestão de permissões granulares
- [ ] API REST completa

## 🆘 Troubleshooting

### Erro de conexão com banco de dados
```bash
# Verificar se o container PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs
docker logs flowsint-postgres-prod
```

### Erro 502 Bad Gateway
```bash
# Verificar PHP-FPM
sudo systemctl status php8.1-fpm
sudo systemctl restart php8.1-fpm

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Sessão expirando muito rápido
Edite `php.ini`:
```ini
session.gc_maxlifetime = 1800
session.cookie_lifetime = 0
```

## 📧 Suporte

Para dúvidas ou problemas, contate: support@scarletredsolutions.com

---

**RSL Control** | © 2025 Scarlet Red Solutions | v1.0.0
