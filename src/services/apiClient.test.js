import { describe, it, expect, beforeEach, vi } from 'vitest';

import apiClient, { setSessionExpiredHandler } from './apiClient';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

// fetch double: answers by URL path, one queued response per call
function mockFetch(routes) {
  const fetchMock = vi.fn(async (url) => {
    const path = url.replace(/^.*\/api/, '');
    const queue = routes[path];

    if (!queue?.length) {
      throw new Error(`unexpected request: ${path}`);
    }

    const next = queue.shift();
    return typeof next === 'function' ? next() : next;
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const calledPaths = (fetchMock) => fetchMock.mock.calls.map(([url]) => url.replace(/^.*\/api/, ''));

describe('apiClient', () => {
  let onExpired;

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
      expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
    });

    it('returns null for 204 and for an empty body', async () => {
      mockFetch({ '/a': [new Response(null, { status: 204 })], '/b': [new Response('', { status: 200 })] });

      await expect(apiClient('/a')).resolves.toBeNull();
      await expect(apiClient('/b')).resolves.toBeNull();
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
      let finishRefresh;
      const refreshDone = new Promise((resolve) => { finishRefresh = resolve; });

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

    it('does not refresh a failed login', async () => {
      const fetchMock = mockFetch({ '/auth/login': [json({ error: 'Invalid username or password' }, 401)] });

      await expect(apiClient('/auth/login', { method: 'POST' })).rejects.toMatchObject({
        message: 'Invalid username or password', status: 401,
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
    it('uses the error code as message and keeps the data', async () => {
      mockFetch({ '/cows/1': [json({ error: 'COW_NOT_FOUND' }, 404)] });

      await expect(apiClient('/cows/1')).rejects.toMatchObject({
        name: 'ApiError', message: 'COW_NOT_FOUND', status: 404, data: { error: 'COW_NOT_FOUND' },
      });
    });

    it('shows a readable message for validation errors', async () => {
      const body = { error: 'VALIDATION_ERROR', issues: [{ path: 'body.code', message: 'Too big' }] };
      mockFetch({ '/collars': [json(body, 400)] });

      await expect(apiClient('/collars', { method: 'POST' })).rejects.toMatchObject({
        message: 'Hay datos inválidos. Revisá el formulario.', data: body,
      });
    });

    it('falls back to a text body, or a generic message', async () => {
      mockFetch({
        '/a': [new Response('Bad gateway', { status: 502 })],
        '/b': [new Response('', { status: 500 })],
      });

      await expect(apiClient('/a')).rejects.toMatchObject({ message: 'Bad gateway' });
      await expect(apiClient('/b')).rejects.toMatchObject({ message: 'Error al comunicarse con el servidor' });
    });
  });
});
