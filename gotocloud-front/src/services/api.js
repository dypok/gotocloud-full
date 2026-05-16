// src/services/api.js

const API_BASE_URL = 'http://localhost:8000/api'; // La URL por defecto de FastAPI

export const chatService = {
    // Simular envío de mensaje (Mock mientras no hay backend)
    sendMessage: async (sessionId, message) => {
        // Cuando el back esté listo, descomentas esto:
        /*
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, message })
        });
        return res.json();
        */

        // MOCK (Para que sigas probando la UI):
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    response: `(Simulado) He recibido tu mensaje sobre: "${message}". Como Agent 1, buscaría en RAG.`,
                });
            }, 1000);
        });
    }
};

export const dashboardService = {
    getMetrics: async () => {
        // await fetch(`${API_BASE_URL}/dashboard/metrics`).then(res => res.json())

        return new Promise((resolve) => {
            setTimeout(() => resolve({
                kpis: { active_incidents: 12, sla_risk: 1, sentiment: "Positivo", leads: 4 }
            }), 500);
        });
    },

    queryIntelligenceAgent: async (query) => {
        // POST a /api/intelligence/query
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                answer: `(Simulado) Tras analizar la BD, encontré esto respecto a "${query}".`,
                type: 'general'
            }), 1500);
        });
    }
};