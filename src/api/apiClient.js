import {
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  setStoredTokens,
} from '../utils/authStorage';

const AUTH_API_BASE = import.meta.env.VITE_AUTH_API_BASE || '';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

let refreshPromise = null;

const parsePayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return '';
  }
};

const resolveMessage = (payload, fallbackStatus) =>
  payload?.message ||
  payload?.error ||
  payload?.detail ||
  payload?.reason ||
  payload?.title ||
  (typeof payload === 'string' && payload) ||
  `Request failed with status ${fallbackStatus}`;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Tidak ada refresh token yang tersedia.');
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const payload = await parsePayload(response);

        if (!response.ok) {
          throw new ApiError(resolveMessage(payload, response.status), response.status, payload);
        }

        setStoredTokens({
          accessToken: payload?.accessToken || '',
          refreshToken: payload?.refreshToken || refreshToken,
        });

        return payload?.accessToken || '';
      })
      .catch((error) => {
        clearStoredTokens();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiFetch = async (path, options = {}, config = {}) => {
  const { auth = true, retry = true } = config;
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = auth ? getAccessToken() : '';
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (response.status === 401 && auth && retry && getRefreshToken()) {
    try {
      const nextAccessToken = await refreshAccessToken();
      const retryHeaders = new Headers(options.headers || {});

      if (!isFormData && options.body && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      if (nextAccessToken) {
        retryHeaders.set('Authorization', `Bearer ${nextAccessToken}`);
      }

      const retryResponse = await fetch(path, {
        ...options,
        headers: retryHeaders,
      });

      const retryPayload = await parsePayload(retryResponse);

      if (!retryResponse.ok) {
        throw new ApiError(resolveMessage(retryPayload, retryResponse.status), retryResponse.status, retryPayload);
      }

      return retryPayload;
    } catch (error) {
      clearStoredTokens();
      throw error;
    }
  }

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError(resolveMessage(payload, response.status), response.status, payload);
  }

  return payload;
};
