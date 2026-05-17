const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatService = {
    sendMessage: async (sessionId, message, channel = 'webchat') => {
        const payload = {
            session_id: sessionId,
            message,
            channel,
        };

        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Chat request failed: ${res.status} ${errorText}`);
        }

        return res.json();
    },
};

export const dashboardService = {
    getMetrics: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                kpis: { active_incidents: 12, sla_risk: 1, sentiment: "Positivo", leads: 4 }
            }), 500);
        });
    },
    queryIntelligenceAgent: async (query) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                answer: `(Simulado) Tras analizar la BD, encontré esto respecto a "${query}".`,
                type: 'general'
            }), 1500);
        });
    }
};
