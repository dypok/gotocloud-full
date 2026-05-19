-- 0. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT,
    anonymous BOOLEAN DEFAULT TRUE,
    caller_type TEXT,
    first_channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_phone_number ON sessions(phone_number);

-- 2. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    channel TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    sentiment_score FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);

-- 3. INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    category TEXT,
    priority TEXT,
    status TEXT DEFAULT 'open',
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_incidents_session_id ON incidents(session_id);

-- 4. VECTOR DOCUMENTS (RAG)
-- Using 768 dimensions for Google Gemini text-embedding-004
CREATE TABLE IF NOT EXISTS vector_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(768)
);

-- 5. LEAD OPPORTUNITIES
CREATE TABLE IF NOT EXISTS lead_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    phone_number TEXT,
    industry TEXT,
    interest_area TEXT,
    lead_score INTEGER,
    recommended_action TEXT,
    qualified BOOLEAN DEFAULT FALSE,
    notes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_leads_session_id ON lead_opportunities(session_id);
CREATE INDEX idx_leads_score ON lead_opportunities(lead_score);

-- 6. ESCALATIONS
CREATE TABLE IF NOT EXISTS escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    reason TEXT,
    conversation_summary TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_escalations_status ON escalations(status);

-- 7. CHANNEL SWITCHES
CREATE TABLE IF NOT EXISTS channel_switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    from_channel TEXT,
    to_channel TEXT,
    reason TEXT,
    context_summary TEXT,
    initiated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INSIGHTS
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT,
    severity TEXT DEFAULT 'info',
    title TEXT NOT NULL,
    narrative TEXT NOT NULL,
    recommended_action TEXT,
    data_payload JSONB DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT,
    title TEXT NOT NULL,
    content_markdown TEXT,
    distribution_channels JSONB DEFAULT '[]',
    distributed BOOLEAN DEFAULT FALSE,
    distributed_at TIMESTAMP WITH TIME ZONE,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CHAT LOGS
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    user_message TEXT,
    bot_response TEXT,
    lead_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
