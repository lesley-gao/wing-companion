// utils/api.ts
// API configuration and utility functions

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  SIGNALR_HUB_URL: import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:5001/notificationHub',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
} as const;

// Debug: Log the API configuration
console.log('API_CONFIG:', API_CONFIG);

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // For local development, always use relative URLs to leverage Vite proxy
  if (API_CONFIG.ENVIRONMENT === 'development') {
    console.log(`Using relative URL for development: ${endpoint}`);
    return endpoint;
  }
  
  // If endpoint starts with /api, use the base URL
  if (endpoint.startsWith('/api')) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log(`Using base URL: ${url}`);
    return url;
  }
  
  // Otherwise, assume it's a relative path and use the base URL
  const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
  console.log(`Using relative path URL: ${url}`);
  return url;
};

/**
 * Get authentication headers for API requests
 * @returns Headers object with Authorization token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise with response
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);
  const headers = getAuthHeaders();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };
  
  if (API_CONFIG.ENABLE_DEBUG) {
    console.log(`API Request: ${config.method || 'GET'} ${url}`, config);
  }
  
  return fetch(url, config);
};

/**
 * Make a GET request
 * @param endpoint - API endpoint
 * @returns Promise with response
 */
export const apiGet = (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'GET' });
};

/**
 * Make a POST request
 * @param endpoint - API endpoint
 * @param data - Request body
 * @returns Promise with response
 */
export const apiPost = (endpoint: string, data?: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PUT request
 * @param endpoint - API endpoint
 * @param data - Request body
 * @returns Promise with response
 */
export const apiPut = (endpoint: string, data?: any): Promise<Response> => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a DELETE request
 * @param endpoint - API endpoint
 * @returns Promise with response
 */
export const apiDelete = (endpoint: string): Promise<Response> => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

/**
 * Handle API response and parse JSON
 * @param response - Fetch response
 * @returns Parsed JSON data
 */
export const handleApiResponse = async <T = any>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as T;
}; 