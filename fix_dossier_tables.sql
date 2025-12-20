-- Create dossier_access_logs table
CREATE TABLE IF NOT EXISTS dossier_access_logs (
    id UUID PRIMARY KEY,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    user_id UUID,
    access_token VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(255),
    accessed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_dossier_access_logs_dossier_id ON dossier_access_logs(dossier_id);
CREATE INDEX IF NOT EXISTS idx_dossier_access_logs_user_id ON dossier_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dossier_access_logs_accessed_at ON dossier_access_logs(accessed_at);

-- Create dossier_ia_chats table
CREATE TABLE IF NOT EXISTS dossier_ia_chats (
    id UUID PRIMARY KEY,
    dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    user_id UUID,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    context JSONB,
    sources JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_dossier_ia_chats_dossier_id ON dossier_ia_chats(dossier_id);
CREATE INDEX IF NOT EXISTS idx_dossier_ia_chats_user_id ON dossier_ia_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_dossier_ia_chats_created_at ON dossier_ia_chats(created_at);
