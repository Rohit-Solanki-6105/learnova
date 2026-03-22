export const API_URL = 'http://localhost:8000/api';

export const setTokens = (access: string, refresh: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const normalizedHeaders = new Headers(options.headers);
  if (!isFormDataBody && !normalizedHeaders.has('Content-Type')) {
    normalizedHeaders.set('Content-Type', 'application/json');
  }
  
  if (token) {
    normalizedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: normalizedHeaders,
  });

  if (response.status === 401) {
    // Basic handle of 401: logout. For better UX, refresh token logic goes here.
    clearTokens();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
  }

  return response;
};
