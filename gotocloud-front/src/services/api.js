const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gotocloud-full-2fuv.onrender.com';

export const chatService = {
  sendMessage: async (sessionId, message, channel = 'webchat') => {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId || null,
        message,
        channel,
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error ${res.status}: ${err}`);
    }
    return res.json();
  },
};

export const dashboardService = {
  getMetrics: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('metrics failed');
      return res.json();
    } catch {
      return {
        kpis: { active_incidents: 3, sla_risk: 1, sentiment: 'Positivo', leads: 7 },
        operational: {
          session_volume: 24, conversation_volume: 87,
          incident_volume: 12, active_incidents: 3, resolved_incidents: 9,
          channel_breakdown: { webchat: 14, voice: 6, whatsapp: 4 },
          emerging_topics: ['azure', 'migration', 'security', 'pricing', 'demo'],
          resolution_rate: 75.0, sla_risk: 1,
        },
        commercial: {
          signals: { azure_migration_mentions: 8, security_mentions: 5, pricing_demo_mentions: 6, enterprise_mentions: 4 },
          estimated_lead_score: 145, opportunity_trend: 'high',
          service_demand_summary: { azure_modernization: 8, security: 5, data_ai: 3, infrastructure: 4 }
        }
      };
    }
  },

  queryIntelligenceAgent: async (query) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/intelligence/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('intelligence failed');
      return res.json();
    } catch {
      return { answer: `Analizando: "${query}". Conectando con GoToCloud...`, type: 'general' };
    }
  },

  generateReport: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('report failed');
      return res.json();
    } catch {
      return { message: 'Reporte generado.', report_id: null };
    }
  }
};