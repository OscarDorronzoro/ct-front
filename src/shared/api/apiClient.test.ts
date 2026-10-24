import {
  describe, it, expect, beforeEach, vi, type Mock,
} from 'vitest';
import { z } from 'zod';
import { apiClient, errorMessage, setSessionExpiredHandler } from './apiClient';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

type Route = Response | (() => Promise<Response>);

// fetch double: answers by URL path, one queued response per call
function mockFetch(routes: Record<string, Route[]>) {
  const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => {
    const path = url.replace(/^.*\/api/, '');
    const next = routes[path]?.shift();

    if (!next) {
      throw new Error(`unexpected request: ${path}`);
    }

    return typeof next === 'function' ? next() : next;
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const calledPaths = (fetchMock: Mock<(url: string, options?: RequestInit) => Promise<Response>>) => (
  fetchMock.mock.calls.map(([url]) => url.replace(/^.*\/api/, ''))
);

describe('apiClient', () => {
  let onExpired: Mock<() => void>;

  beforeEach(() => {
    onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);
    // Backend errors are logged; keep the test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('successful responses', () => {
    it('parses JSON and sends the session cookies', async () => {
      const fetchMock = mockFetch({ '/cows': [json([{ id: 8 }])] });

      await expect(apiClient('/cows')).resolves.toEqual([{ id: 8 }]);
      expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' });
    });

    it('returns null for 204 and for an empty body', async () => {
      mockFetch({ '/a': [new Response(null, { status: 204 })], '/b': [new Response('', { status: 200 })] });

      await expect(apiClient('/a')).resolves.toBeNull();
      await expect(apiClient('/b')).resolves.toBeNull();
    });
  });

  describe('response schema', () => {
    const Cow = z.object({ id: z.number(), name: z.string() });

    it('returns the data parsed by the schema', async () => {
      mockFetch({ '/cows/8': [json({ id: 8, name: 'Aurora', extra: true })] });

      await expect(apiClient('/cows/8', { schema: Cow })).resolves.toEqual({ id: 8, name: 'Aurora' });
    });

    it('rejects a response that does not match the schema', async () => {
      mockFetch({ '/cows/8': [json({ id: '8' })] });

      await expect(apiClient('/cows/8', { schema: Cow })).rejects.toMatchObject({
        name: 'ApiError',
        code: 'INVALID_RESPONSE',
        message: 'El servidor respondió datos inesperados.',
        data: { issues: [expect.objectContaining({ path: ['id'] }), expect.objectContaining({ path: ['name'] })] },
      });
    });

    it('does not send the schema to fetch', async () => {
      const fetchMock = mockFetch({ '/cows/8': [json({ id: 8, name: 'Aurora' })] });

      await apiClient('/cows/8', { schema: Cow });
      expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('schema');
    });
  });

  describe('expired access token', () => {
    it('refreshes the session once and retries the request', async () => {
      const fetchMock = mockFetch({
        '/cows': [json({}, 401), json([{ id: 8 }])],
        '/auth/refresh': [json({ message: 'Token refreshed' })],
      });

      await expect(apiClient('/cows')).resolves.toEqual([{ id: 8 }]);
      expect(calledPaths(fetchMock)).toEqual(['/cows', '/auth/refresh', '/cows']);
      expect(onExpired).not.toHaveBeenCalled();
    });

    it('shares one refresh between requests that fail at the same time', async () => {
      let finishRefresh: (response: Response) => void = () => {};
      const refreshDone = new Promise<Response>((resolve) => { finishRefresh = resolve; });

      const fetchMock = mockFetch({
        '/cows': [json({}, 401), json(['cows'])],
        '/zones': [json({}, 401), json(['zones'])],
        '/auth/refresh': [() => refreshDone],
      });

      const requests = Promise.all([apiClient('/cows'), apiClient('/zones')]);
      await vi.waitFor(() => expect(calledPaths(fetchMock)).toContain('/auth/refresh'));
      finishRefresh(json({ message: 'Token refreshed' }));

      await expect(requests).resolves.toEqual([['cows'], ['zones']]);
      expect(calledPaths(fetchMock).filter((p) => p === '/auth/refresh')).toHaveLength(1);
    });

    it('ends the session when the refresh fails', async () => {
      mockFetch({
        '/cows': [json({}, 401)],
        '/auth/refresh': [json({ error: 'Invalid refresh token' }, 401)],
      });

      await expect(apiClient('/cows')).rejects.toMatchObject({ status: 401, code: 'SESSION_EXPIRED' });
      expect(onExpired).toHaveBeenCalledOnce();
    });

    it('keeps the session when the refresh fails for a server error', async () => {
      mockFetch({
        '/cows': [json({}, 401)],
        '/auth/refresh': [new Response('Bad gateway', { status: 502 })],
      });

      await expect(apiClient('/cows')).rejects.toMatchObject({ status: 502, code: 'SERVER_UNAVAILABLE' });
      expect(onExpired).not.toHaveBeenCalled();
    });

    it('keeps the session when the refresh cannot reach the server', async () => {
      mockFetch({
        '/cows': [json({}, 401)],
        '/auth/refresh': [() => Promise.reject(new TypeError('Failed to fetch'))],
      });

      await expect(apiClient('/cows')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
      expect(onExpired).not.toHaveBeenCalled();
    });

    it('does not refresh a failed login', async () => {
      const fetchMock = mockFetch({ '/auth/login': [json({ error: 'Invalid username or password' }, 401)] });

      await expect(apiClient('/auth/login', { method: 'POST' })).rejects.toMatchObject({
        status: 401, data: { error: 'Invalid username or password' },
      });
      expect(calledPaths(fetchMock)).toEqual(['/auth/login']);
    });

    it('does not refresh twice for the same request', async () => {
      const fetchMock = mockFetch({
        '/cows': [json({}, 401), json({ error: 'Unauthorized' }, 401)],
        '/auth/refresh': [json({ message: 'Token refreshed' })],
      });

      await expect(apiClient('/cows')).rejects.toMatchObject({ status: 401 });
      expect(calledPaths(fetchMock)).toEqual(['/cows', '/auth/refresh', '/cows']);
    });
  });

  describe('backend errors', () => {
    it('reports a failed connection as NETWORK_ERROR', async () => {
      mockFetch({ '/cows': [() => Promise.reject(new TypeError('Failed to fetch'))] });

      await expect(apiClient('/cows')).rejects.toMatchObject({
        name: 'ApiError', status: 0, code: 'NETWORK_ERROR', message: 'No se pudo conectar con el servidor.',
      });
    });

    it('translates the error code and keeps the code and the data', async () => {
      mockFetch({ '/cows/1': [json({ error: 'COW_NOT_FOUND' }, 404)] });

      await expect(apiClient('/cows/1')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'La vaca no existe o fue eliminada.',
        code: 'COW_NOT_FOUND',
        status: 404,
        data: { error: 'COW_NOT_FOUND' },
      });
    });

    it('never shows an untranslated code or message: falls back to the status', async () => {
      mockFetch({
        '/a': [json({ error: 'SOMETHING_NEW' }, 409)],
        '/b': [json({ error: 'Collar not found' }, 404)],
      });

      await expect(apiClient('/a')).rejects.toMatchObject({
        code: 'SOMETHING_NEW', message: 'Error al comunicarse con el servidor',
      });
      await expect(apiClient('/b')).rejects.toMatchObject({
        code: undefined, message: 'No se encontró lo que buscabas: puede haber sido eliminado.',
      });
    });

    it('shows a readable message for validation errors', async () => {
      const body = { error: 'VALIDATION_ERROR', issues: [{ path: 'body.code', message: 'Too big' }] };
      mockFetch({ '/collars': [json(body, 400)] });

      await expect(apiClient('/collars', { method: 'POST' })).rejects.toMatchObject({
        message: 'Hay datos inválidos. Revisá el formulario.', data: body,
      });
    });

    it('explains a server error without showing its body', async () => {
      mockFetch({ '/a': [new Response('Bad gateway', { status: 502 })] });

      await expect(apiClient('/a')).rejects.toMatchObject({
        status: 502, data: 'Bad gateway', message: 'El servidor tuvo un problema. Intentá de nuevo en unos segundos.',
      });
    });
  });

  describe('errorMessage', () => {
    it('uses the message of a known API error, and the fallback of the action otherwise', async () => {
      mockFetch({
        '/a': [json({ error: 'LAST_ADMIN' }, 409)],
        '/b': [json({ error: 'SOMETHING_NEW' }, 409)],
      });

      const known = await apiClient('/a').catch((err: unknown) => err);
      const unknown = await apiClient('/b').catch((err: unknown) => err);

      expect(errorMessage(known, 'No se pudo guardar.')).toBe('Tiene que quedar al menos un administrador.');
      expect(errorMessage(unknown, 'No se pudo guardar.')).toBe('No se pudo guardar.');
      expect(errorMessage(new TypeError('x is undefined'), 'No se pudo guardar.')).toBe('No se pudo guardar.');
    });
  });
});
