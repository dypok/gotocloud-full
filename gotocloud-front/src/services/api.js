const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
    sendMessage: async (sessionId, message, channel = 'web_chat') => {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                message,
                channel
            })
        });
        if (!res.ok) throw new Error('Error del servidor');
        return res.json();
    }
};

export const dashboardService = {
    getMetrics: async () => {
        const res = await fetch(`${API_BASE_URL}/dashboard/metrics`);
        if (!res.ok) throw new Error('Error obteniendo métricas');
        return res.json();
    },
    queryIntelligenceAgent: async (query) => {
        const res = await fetch(`${API_BASE_URL}/intelligence/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        if (!res.ok) throw new Error('Error consultando agente');
        return res.json();
    }
};