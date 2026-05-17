const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error de red' }));
      throw new Error(err.detail || 'Credenciales incorrectas');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('admin_user', JSON.stringify({ name: data.name, role: data.role }));
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      return null;
    }
  },

  verifyToken: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },
};

export const dashboardService = {
  getMetrics: async (hours = 24) => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/metrics?hours=${hours}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  queryIntelligenceAgent: async (query, hours = 24) => {
    const res = await fetch(`${API_BASE_URL}/admin/intelligence/query`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, hours }),
    });
    return handleResponse(res);
  },

  getInsights: async (limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/admin/insights?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
