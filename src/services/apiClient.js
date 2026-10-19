import ApiError from '../errors/ApiError';
import logger from '../utils/logger';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_URL = `${API_BASE}/api`;

let refreshPromise = null;
let onSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

// The server could not be reached (no connection, DNS, CORS...): not a session problem
function networkError(err) {
  logger.error('Network error', err);
  return new ApiError('No se pudo conectar con el servidor.', 0, { code: 'NETWORK_ERROR' });
}

// fetch that turns a failed connection into an ApiError
async function request(url, options) {
  try {
    return await fetch(url, options);
  } catch (err) {
    throw networkError(err);
  }
}

async function refreshAccessToken() {
  // Wait ongoing refresh
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = request(`${API_URL}/auth/refresh`, {
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

  const response = await request(`${API_URL}${path}`, {
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

    // Only a rejected refresh token ends the session. A server error (5xx while the backend
    // restarts, for example) keeps the user logged in: the next request can succeed.
    if (refreshResponse.status !== 401 && refreshResponse.status !== 403) {
      throw new ApiError(
        'El servidor no está disponible. Intentá de nuevo en unos segundos.',
        refreshResponse.status,
        { code: 'SERVER_UNAVAILABLE' },
      );
    }

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

  // Invalid input: the details (data.issues) are for developers, not for the user
  const message =
    (data?.error === 'VALIDATION_ERROR' ? 'Hay datos inválidos. Revisá el formulario.' : null) ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    'Error al comunicarse con el servidor';

  throw new ApiError(
    message,
    response.status,
    data,
  );
}
