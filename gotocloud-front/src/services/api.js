const API_URL = 'http://127.0.0.1:8000';

export const chatService = {
  // Conectar el CustomerPortal al chat_router real
  sendMessage: async (sessionId, message, phoneNumber) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, message, phone_number: phoneNumber })
    });
    return response.json();
  }
};

export const adminService = {
  // Conectar el InternalDashboard a los datos reales
  getDashboardMetrics: async () => {
    const token = localStorage.getItem('auth_token'); // Sacamos el token guardado
    const response = await fetch(`${API_URL}/admin/metrics`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <- Esto es lo que lee la librería 'jose'
      }
    });
    return response.json();
  }
};