import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ApiError } from '@/shared/api';
import {
  getPushKey, isSubscriptionActive, saveSubscription, deleteSubscription, sendTestNotification,
} from '../api/pushApi';
import usePushNotifications from './usePushNotifications';

vi.mock('../api/pushApi');

// The key of the server ('AQID' is the bytes 1, 2, 3) and a subscription of the browser
const SERVER_KEY = 'AQID';
const subscriptionWith = (keyBytes) => ({
  endpoint: 'https://push.example.com/device-1',
  options: { applicationServerKey: Uint8Array.from(keyBytes).buffer },
  toJSON: () => ({ endpoint: 'https://push.example.com/device-1', keys: { p256dh: 'p', auth: 'a' } }),
  unsubscribe: vi.fn(async () => true),
});

// The browser: a service worker with push, notifications with a permission, and the device
function browser({
  permission = 'default', grant = 'granted', subscription = null, push = true, userAgent = 'Chrome',
} = {}) {
  const pushManager = {
    getSubscription: vi.fn(async () => subscription),
    subscribe: vi.fn(async () => subscriptionWith([1, 2, 3])),
  };

  vi.stubGlobal('navigator', {
    userAgent,
    platform: 'Linux',
    maxTouchPoints: 0,
    ...(push && { serviceWorker: { ready: Promise.resolve({ pushManager }) } }),
  });
  if (push) {
    vi.stubGlobal('PushManager', function PushManager() {});
  } else {
    vi.stubGlobal('PushManager', undefined);
    delete window.PushManager;
  }
  vi.stubGlobal('Notification', { permission, requestPermission: vi.fn(async () => grant) });

  return pushManager;
}

async function statusOf(hook) {
  await waitFor(() => expect(hook.result.current.status).not.toBe('checking'));
  return hook.result.current.status;
}

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getPushKey.mockResolvedValue(SERVER_KEY);
    isSubscriptionActive.mockResolvedValue(true);
    saveSubscription.mockResolvedValue();
    deleteSubscription.mockResolvedValue();
  });

  describe('state of the device', () => {
    it('is unsupported without push in the browser', async () => {
      browser({ push: false });
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('unsupported');
    });

    it('asks to install the app on an iPhone (push only for installed apps)', async () => {
      browser({ push: false, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('install');
    });

    it('is denied when the site is blocked', async () => {
      browser({ permission: 'denied' });
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('denied');
    });

    it('is unconfigured when the server has no keys', async () => {
      browser();
      getPushKey.mockResolvedValue(null);
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('unconfigured');
    });

    it('is on only when the server sends to this device in this session', async () => {
      browser({ permission: 'granted', subscription: subscriptionWith([1, 2, 3]) });
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('on');

      isSubscriptionActive.mockResolvedValue(false);
      expect(await statusOf(renderHook(() => usePushNotifications()))).toBe('off');
    });
  });

  describe('turning them on', () => {
    it('asks for permission, subscribes with the key of the server and tells the server', async () => {
      const pushManager = browser();
      const hook = renderHook(() => usePushNotifications());
      await statusOf(hook);

      await act(() => hook.result.current.enable());

      expect(Notification.requestPermission).toHaveBeenCalled();
      expect([...pushManager.subscribe.mock.calls[0][0].applicationServerKey]).toEqual([1, 2, 3]);
      expect(saveSubscription).toHaveBeenCalledWith(expect.objectContaining({ endpoint: 'https://push.example.com/device-1' }));
      expect(hook.result.current.status).toBe('on');
    });

    it('stays off if the user dismisses the permission, and denied if they block it', async () => {
      browser({ grant: 'default' });
      const dismissed = renderHook(() => usePushNotifications());
      await statusOf(dismissed);
      await act(() => dismissed.result.current.enable());
      expect(dismissed.result.current.status).toBe('off');

      browser({ grant: 'denied' });
      const blocked = renderHook(() => usePushNotifications());
      await statusOf(blocked);
      await act(() => blocked.result.current.enable());
      expect(blocked.result.current.status).toBe('denied');
      expect(saveSubscription).not.toHaveBeenCalled();
    });

    it('reuses the subscription of the device made with the same key', async () => {
      const pushManager = browser({ permission: 'granted', subscription: subscriptionWith([1, 2, 3]) });
      isSubscriptionActive.mockResolvedValue(false);
      const hook = renderHook(() => usePushNotifications());
      await statusOf(hook);

      await act(() => hook.result.current.enable());

      expect(pushManager.subscribe).not.toHaveBeenCalled();
      expect(saveSubscription).toHaveBeenCalled();
    });

    it('replaces a subscription made with another key (the server changed its keys)', async () => {
      const old = subscriptionWith([9, 9, 9]);
      const pushManager = browser({ permission: 'granted', subscription: old });
      isSubscriptionActive.mockResolvedValue(false);
      const hook = renderHook(() => usePushNotifications());
      await statusOf(hook);

      await act(() => hook.result.current.enable());

      expect(old.unsubscribe).toHaveBeenCalled();
      expect(pushManager.subscribe).toHaveBeenCalled();
      expect(hook.result.current.status).toBe('on');
    });

    it('shows the error of the server', async () => {
      browser();
      saveSubscription.mockRejectedValue(new ApiError('No tiene permiso para hacer esto.', 403, { error: 'FORBIDDEN' }));
      const hook = renderHook(() => usePushNotifications());
      await statusOf(hook);

      await act(() => hook.result.current.enable());

      expect(hook.result.current.error).toBe('No tiene permiso para hacer esto.');
      expect(hook.result.current.status).toBe('off');
    });
  });

  it('turns them off: the server forgets the device and the browser unsubscribes', async () => {
    const subscription = subscriptionWith([1, 2, 3]);
    browser({ permission: 'granted', subscription });
    const hook = renderHook(() => usePushNotifications());
    expect(await statusOf(hook)).toBe('on');

    await act(() => hook.result.current.disable());

    expect(deleteSubscription).toHaveBeenCalledWith('https://push.example.com/device-1');
    expect(subscription.unsubscribe).toHaveBeenCalled();
    expect(hook.result.current.status).toBe('off');
  });

  it('says whether the test notification was sent', async () => {
    browser({ permission: 'granted', subscription: subscriptionWith([1, 2, 3]) });
    const hook = renderHook(() => usePushNotifications());
    await statusOf(hook);

    sendTestNotification.mockResolvedValue(1);
    await act(() => hook.result.current.sendTest());
    expect(hook.result.current.message).toMatch(/^Notificación enviada/);

    sendTestNotification.mockResolvedValue(0);
    await act(() => hook.result.current.sendTest());
    expect(hook.result.current.message).toMatch(/^No se envió/);
  });
});
