const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://onecredit-backend-8p7u.onrender.com/api';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: createHeaders(options.auth !== false),
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'GET', ...options }),
  
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { method: 'POST', body, ...options }),
  
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { method: 'PUT', body, ...options }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'DELETE', ...options }),
  
  patch: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { method: 'PATCH', body, ...options }),
};

export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getToken: getAuthToken,
  
  removeToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

export default api;
