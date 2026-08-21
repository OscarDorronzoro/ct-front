import ApiError from '../errors/ApiError';
import logger from '../utils/logger';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_URL = `${API_BASE}/api`;

let refreshPromise = null;
let onSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

async function refreshAccessToken() {
  // Wait ongoing refresh
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}


async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default async function apiClient(path, options = {}, retry = true) {

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  });

  // Successfull request
  if (response.ok) {
    return parseResponse(response);
  }


  // Expired access token
  if (
    response.status === 401 &&
    retry &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'
  ) {
    const refreshResponse = await refreshAccessToken();

    if (refreshResponse.ok) {
      return apiClient(path, options, false);
    }

    // Logout
    onSessionExpired?.();

    throw new ApiError(
      'Sesión expirada',
      401,
      {
        code: 'SESSION_EXPIRED',
      },
    );
  }

  // Backend error
  const data = await parseResponse(response);
  logger.error(data);

  const message =
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    'Error al comunicarse con el servidor';

  throw new ApiError(
    message,
    response.status,
    data,
  );
}
