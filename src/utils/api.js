import env from './env';

/**
 * API Client for making HTTP requests
 * Handles authentication, error handling, and response parsing
 */

const API_BASE_URL = env.apiUrl;

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Make an API request
 * @param {string} endpoint - The API endpoint (e.g., '/leads')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session management
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await parseResponse(response);
      const error = new Error(errorData?.message || 'Something went wrong');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await parseResponse(response);
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

/**
 * Parse the response based on content type
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// HTTP Method Helpers
const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint, data = {}, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  put: (endpoint, data = {}, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
    
  patch: (endpoint, data = {}, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export default api;
