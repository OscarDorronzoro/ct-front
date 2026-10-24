import { z, type ZodType } from 'zod';
import { logger } from '@/shared/lib/logger';
import { ApiError, errorCode } from './ApiError';
import { ERROR_MESSAGES, GENERIC_MESSAGE, statusMessage } from './errorMessages';

const API_BASE: string = import.meta.env.VITE_API_BASE || '';
const API_URL = `${API_BASE}/api`;

let refreshPromise: Promise<Response> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// The server could not be reached (no connection, DNS, CORS...): not a session problem
function networkError(err: unknown) {
  logger.error('Network error', err);
  return new ApiError('No se pudo conectar con el servidor.', 0, { code: 'NETWORK_ERROR' });
}

// fetch that turns a failed connection into an ApiError
async function request(url: string, options: RequestInit) {
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

async function parseResponse(response: Response): Promise<unknown> {
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

// Checks a successful response against the schema of the endpoint. It also runs in production:
// a response the frontend does not understand fails here, with a clear error, instead of
// breaking a component later.
function validate<T>(path: string, data: unknown, schema: ZodType<T>): T {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  logger.error(`Invalid response of ${path}\n${z.prettifyError(result.error)}`);
  throw new ApiError(
    'El servidor respondió datos inesperados.',
    0,
    { code: 'INVALID_RESPONSE', issues: result.error.issues },
  );
}

// Text for the user: the one of its code, or of the status. The details (data.message,
// data.issues of a VALIDATION_ERROR) are for developers.
function backendErrorMessage(data: unknown, status: number) {
  const code = errorCode(data);
  return (code && ERROR_MESSAGES[code]) || statusMessage(status);
}

export interface ApiOptions<T> extends RequestInit {
  // Schema of the response body: the response is validated and typed with it
  schema?: ZodType<T>;
}

async function send<T>(path: string, options: ApiOptions<T>, retry: boolean): Promise<T | unknown> {
  const { schema, ...init } = options;

  const response = await request(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
  });

  // Successfull request
  if (response.ok) {
    const data = await parseResponse(response);
    return schema ? validate(path, data, schema) : data;
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
      return send(path, options, false);
    }

    // Only a rejected refresh token ends the session. A server error (5xx while the backend
    // restarts, for example) keeps the user logged in: the next request can succeed.
    if (refreshResponse.status !== 401 && refreshResponse.status !== 403) {
      throw new ApiError(
        'El servidor no está disponible. Intente de nuevo en unos segundos.',
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

  throw new ApiError(backendErrorMessage(data, response.status), response.status, data);
}

// Request to the backend. With a schema the response is validated and typed; without one it
// is unknown (only for responses that are not used, or for code not yet migrated).
export function apiClient<T>(path: string, options: ApiOptions<T> & { schema: ZodType<T> }): Promise<T>;
export function apiClient(path: string, options?: ApiOptions<unknown>): Promise<unknown>;
export function apiClient<T>(path: string, options: ApiOptions<T> = {}) {
  return send(path, options, true);
}

// Options of a request with a JSON body
export function jsonBody(method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// Message of an error for the user: the one of the API error, or the fallback of the action
// ('No se pudo guardar la vaca.') for an unknown failure (a bug, an unexpected response...)
export function errorMessage<T extends string | null>(error: unknown, fallback: T): string | T {
  return error instanceof ApiError && error.message !== GENERIC_MESSAGE ? error.message : fallback;
}
