// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import usePolling from './usePolling';

const INTERVAL = 30000;

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

// Lets the resolved load promises update the hook
const flush = () => act(() => Promise.resolve());

describe('usePolling', () => {
  let calls;
  const load = () => {
    calls += 1;
    return Promise.resolve(calls);
  };

  beforeEach(() => {
    calls = 0;
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads at once and then every interval', async () => {
    const { result } = renderHook(() => usePolling(load, { intervalMs: INTERVAL }));
    await flush();
    expect(result.current.data).toBe(1);

    await act(() => vi.advanceTimersByTimeAsync(INTERVAL));
    expect(result.current.data).toBe(2);
  });

  it('pauses while the page is hidden', async () => {
    renderHook(() => usePolling(load, { intervalMs: INTERVAL }));
    await flush();

    act(() => setHidden(true));
    await act(() => vi.advanceTimersByTimeAsync(5 * INTERVAL));

    expect(calls).toBe(1);
  });

  it('reloads at once when the page is visible again, marking the data as stale meanwhile', async () => {
    let resolveNext;
    let first = true;
    const slowLoad = () => {
      if (first) {
        first = false;
        return Promise.resolve('old');
      }
      return new Promise((resolve) => { resolveNext = resolve; });
    };

    const { result } = renderHook(() => usePolling(slowLoad, { intervalMs: INTERVAL }));
    await flush();

    act(() => setHidden(true));
    await act(() => vi.advanceTimersByTimeAsync(2 * INTERVAL));
    act(() => setHidden(false));

    expect(result.current).toMatchObject({ data: 'old', stale: true });

    await act(async () => resolveNext('new'));
    expect(result.current).toMatchObject({ data: 'new', stale: false });
  });

  it('is not stale after a short absence', async () => {
    const { result } = renderHook(() => usePolling(load, { intervalMs: INTERVAL }));
    await flush();

    act(() => setHidden(true));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    act(() => setHidden(false));

    expect(result.current.stale).toBe(false);
  });

  it('loads once without an interval', async () => {
    renderHook(() => usePolling(load));
    await flush();
    await act(() => vi.advanceTimersByTimeAsync(5 * INTERVAL));

    expect(calls).toBe(1);
  });

  it('drops the result of a load superseded by a new load function', async () => {
    const resolvers = [];
    const loadA = () => new Promise((resolve) => { resolvers.push(resolve); });
    const loadB = () => new Promise((resolve) => { resolvers.push(resolve); });

    const { result, rerender } = renderHook(({ load: current }) => usePolling(current), {
      initialProps: { load: loadA },
    });
    rerender({ load: loadB });

    await act(async () => resolvers[1]('b'));
    await act(async () => resolvers[0]('a'));

    expect(result.current.data).toBe('b');
  });

  it('keeps the last data and reports the error when a load fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let fail = false;
    const flaky = () => (fail ? Promise.reject(new Error('offline')) : Promise.resolve('ok'));

    const { result } = renderHook(() => usePolling(flaky, { intervalMs: INTERVAL }));
    await flush();
    fail = true;
    await act(() => vi.advanceTimersByTimeAsync(INTERVAL));

    expect(result.current.data).toBe('ok');
    expect(result.current.error).toMatchObject({ message: 'offline' });
  });
});
