-- RSL Control Admin Tables
-- Execute este SQL no banco de dados flowsint

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tentativas de login
CREATE TABLE IF NOT EXISTS admin_login_attempts (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    email_attempted VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas rápidas de rate limiting
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
ON admin_login_attempts(ip_address, attempt_time, success);

-- Tabela de sessões (remember me)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para limpeza de sessões expiradas
CREATE INDEX IF NOT EXISTS idx_sessions_expires 
ON admin_sessions(expires_at);

-- Tabela de logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas por tipo de evento e data
CREATE INDEX IF NOT EXISTS idx_security_logs_event_time 
ON security_logs(event_type, created_at DESC);

-- Tabela de auditoria de ações administrativas
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_time 
ON admin_audit_log(admin_id, created_at DESC);

-- Inserir admin padrão (ALTERE A SENHA!)
-- Senha padrão: Admin@2025
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
    'admin@scarletredsolutions.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt de 'Admin@2025'
    'Administrador',
    'superadmin'
) ON CONFLICT (email) DO NOTHING;

-- Comentário: Para gerar novos hashes de senha, use:
-- password_hash('sua_senha_aqui', PASSWORD_BCRYPT);

COMMENT ON TABLE admins IS 'Administradores do painel RSL Control';
COMMENT ON TABLE admin_login_attempts IS 'Registro de tentativas de login para rate limiting';
COMMENT ON TABLE admin_sessions IS 'Sessões de "lembrar-me" dos administradores';
COMMENT ON TABLE security_logs IS 'Logs de eventos de segurança do sistema';
COMMENT ON TABLE admin_audit_log IS 'Trilha de auditoria de ações administrativas';
