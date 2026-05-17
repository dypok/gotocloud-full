// src/services/api.js
// Servicio central de comunicación con el backend GoToCloud para el portal público.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Chat request failed: ${res.status} ${errorText}`);
    }

    return res.json();
  },
};
