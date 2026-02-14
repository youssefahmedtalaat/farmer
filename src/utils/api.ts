// Node.js backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/make-server-a88cdc1e';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

// Get stored access token (in a real app, this would be from auth context)
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Set access token
export const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

// Clear access token
export const clearAccessToken = () => {
  localStorage.removeItem('accessToken');
};

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, requireAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('No access token available');
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTH API CALLS
// ============================================

export const authApi = {
  signup: async (data: {
    email: string;
    password: string;
    fullName: string;
    farmName?: string;
    role?: 'farmer' | 'admin';
  }) => {
    const response = await apiCall<{ success: boolean; user: any; token: string }>('/signup', { method: 'POST', body: data });
    if (response.token) {
      setAccessToken(response.token);
    }
    return response;
  },
  
  login: async (data: {
    email: string;
    password: string;
    role?: 'farmer' | 'admin';
  }) => {
    // Use direct API call to the login endpoint
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/make-server-a88cdc1e';
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.token) {
      setAccessToken(result.token);
    }
    return result;
  },
  
  verify: async () => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No token available');
    }
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/make-server-a88cdc1e';
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
};

// ============================================
// PROFILE API CALLS
// ============================================

export const profileApi = {
  get: async () => {
    return apiCall('/profile', { requireAuth: true });
  },

  update: async (data: any) => {
    return apiCall('/profile', {
      method: 'PUT',
      body: data,
      requireAuth: true,
    });
  },

  getAll: async () => {
    return apiCall('/profile/all', { requireAuth: true });
  },
};

// ============================================
// CROPS API CALLS
// ============================================

export const cropsApi = {
  getAll: async () => {
    return apiCall('/crops', { requireAuth: true });
  },

  add: async (data: {
    name: string;
    quantity?: string;
    stock?: number;
    status?: string;
  }) => {
    return apiCall('/crops', {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },

  update: async (cropId: string, data: any) => {
    return apiCall(`/crops/${cropId}`, {
      method: 'PUT',
      body: data,
      requireAuth: true,
    });
  },

  delete: async (cropId: string) => {
    return apiCall(`/crops/${cropId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },

  deleteAll: async () => {
    return apiCall('/crops', {
      method: 'DELETE',
      requireAuth: true,
    });
  },

  getByUserId: async (userId: string) => {
    return apiCall(`/crops/user/${userId}`, { requireAuth: true });
  },
};

// ============================================
// SUBSCRIPTION API CALLS
// ============================================

export const subscriptionApi = {
  get: async () => {
    return apiCall('/subscription', { requireAuth: true });
  },

  create: async (data: {
    planId: string;
    planName: string;
    price: number;
    duration: string;
  }) => {
    return apiCall('/subscription', {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },

  getAll: async () => {
    return apiCall('/subscription/all', { requireAuth: true });
  },

};

// ============================================
// ACTIVITIES API CALLS
// ============================================

export const activitiesApi = {
  getAll: async () => {
    return apiCall('/activities', { requireAuth: true });
  },

  log: async (data: { action: string; detail?: string }) => {
    return apiCall('/activities', {
      method: 'POST',
      body: data,
      requireAuth: true,
    });
  },
};

// ============================================
// NOTIFICATION PREFERENCES API CALLS
// ============================================

export const notificationsApi = {
  get: async () => {
    return apiCall('/notifications', { requireAuth: true });
  },

  update: async (data: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    stockAlerts?: boolean;
    marketUpdates?: boolean;
    aiRecommendations?: boolean;
  }) => {
    return apiCall('/notifications', {
      method: 'PUT',
      body: data,
      requireAuth: true,
    });
  },
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
  return apiCall('/health');
};
