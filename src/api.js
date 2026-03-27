// Auto-detect API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? ''  // Production: use relative paths for Vercel serverless functions
  : 'http://localhost:3001';  // Development: use local Express server

const buildApiUrl = (path) => `${API_BASE_URL}/api${path}`;

// Fetch with timeout and error handling
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Transaction API
export const transactionAPI = {
  // GET all transactions for a month
  getAll: async (month) => {
    const url = `${buildApiUrl('/transactions')}${month ? `?month=${month}` : ''}`;
    const response = await fetchWithTimeout(url);
    return response.json();
  },

  // GET single transaction
  getById: async (id) => {
    const url = buildApiUrl(`/transactions/${id}`);
    const response = await fetchWithTimeout(url);
    return response.json();
  },

  // POST create transaction
  create: async (transaction) => {
    const url = buildApiUrl('/transactions');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    return response.json();
  },

  // PUT update transaction
  update: async (id, transaction) => {
    const url = buildApiUrl(`/transactions/${id}`);
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
    return response.json();
  },

  // DELETE transaction
  delete: async (id) => {
    const url = buildApiUrl(`/transactions/${id}`);
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Month API
export const monthAPI = {
  getAll: async () => {
    const url = buildApiUrl('/months');
    const response = await fetchWithTimeout(url);
    return response.json();
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const url = buildApiUrl('/health');
    const response = await fetchWithTimeout(url, {}, 5000);
    return response.json();
  } catch {
    return null;
  }
};
