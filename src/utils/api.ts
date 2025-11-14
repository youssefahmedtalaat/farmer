import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a88cdc1e`;

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
    }
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
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
  }) => {
    return apiCall('/signup', { method: 'POST', body: data });
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
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
  return apiCall('/health');
};
