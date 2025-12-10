-- Migration: Create Scarlet-IA Tables
-- Date: 2025-12-09

-- Create scarlet_ia_messages table
CREATE TABLE IF NOT EXISTS scarlet_ia_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID,
    user_id UUID NOT NULL,
    chat_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    content TEXT,
    parts JSONB,
    sources JSONB,
    tools_used JSONB,
    attachments JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for scarlet_ia_messages
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_messages_investigation_id ON scarlet_ia_messages(investigation_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_messages_user_id ON scarlet_ia_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_messages_chat_id ON scarlet_ia_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_messages_created_at ON scarlet_ia_messages(created_at);

-- Create scarlet_ia_notes table
CREATE TABLE IF NOT EXISTS scarlet_ia_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    tags JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for scarlet_ia_notes
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_notes_investigation_id ON scarlet_ia_notes(investigation_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_notes_user_id ON scarlet_ia_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_notes_created_at ON scarlet_ia_notes(created_at);

-- Create scarlet_ia_chat_sessions table
CREATE TABLE IF NOT EXISTS scarlet_ia_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(50) NOT NULL UNIQUE,
    investigation_id UUID,
    user_id UUID NOT NULL,
    title VARCHAR(500),
    message_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for scarlet_ia_chat_sessions
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_chat_sessions_chat_id ON scarlet_ia_chat_sessions(chat_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_chat_sessions_investigation_id ON scarlet_ia_chat_sessions(investigation_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_chat_sessions_user_id ON scarlet_ia_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scarlet_ia_chat_sessions_created_at ON scarlet_ia_chat_sessions(created_at);

-- Verify tables were created
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE 'scarlet_ia%'
ORDER BY 
    table_name;
