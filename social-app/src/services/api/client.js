import { ENV, isApiConfigured } from '../../config/env';

/**
 * Shared HTTP client.
 * Set VITE_API_BASE_URL in `.env` then call api.get / api.post / etc.
 */

function buildUrl(path, query) {
  const base = ENV.API_BASE_URL;
  if (!base) {
    throw new Error(
      'API base URL missing. Add VITE_API_BASE_URL=https://your-api-link in .env and restart the server.'
    );
  }

  const url = new URL(path.startsWith('http') ? path : `${base}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function getAuthToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path, { method = 'GET', body, query, headers = {} } = {}) {
  const token = getAuthToken();
  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  isConfigured: isApiConfigured,
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
