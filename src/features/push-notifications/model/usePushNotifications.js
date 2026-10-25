import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/shared/api';
import { logger } from '@/shared/lib/logger';
import {
  getPushKey, isSubscriptionActive, saveSubscription, deleteSubscription, sendTestNotification,
} from '../api/pushApi';
import { serverKeyBytes } from '../lib/serverKey';

const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

// iPhone / iPad: Web Push only for the app installed on the home screen
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const subscriptionOfDevice = async () => {
  const registration = await navigator.serviceWorker.ready;
  return { registration, subscription: await registration.pushManager.getSubscription() };
};

// Push notifications on this device.
// status: checking | unsupported | install (iOS, not installed) | unconfigured (server without
// keys) | denied (blocked in the browser) | off | on
export default function usePushNotifications() {
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const check = useCallback(async () => {
    if (!supported()) {
      return isIos() ? 'install' : 'unsupported';
    }
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    if (!(await getPushKey())) {
      return 'unconfigured';
    }

    const { subscription } = await subscriptionOfDevice();
    return subscription && (await isSubscriptionActive(subscription.endpoint)) ? 'on' : 'off';
  }, []);

  useEffect(() => {
    let cancelled = false;

    check()
      .then((result) => !cancelled && setStatus(result))
      .catch((err) => {
        logger.error('Error checking push notifications', err);
        if (!cancelled) {
          setStatus('off');
          setError(errorMessage(err, 'No se pudo verificar el estado de las notificaciones.'));
        }
      });

    return () => { cancelled = true; };
  }, [check]);

  // run(action): busy while it runs; the error of the action, or its fallback message
  const run = async (action, fallback) => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await action();
    } catch (err) {
      logger.error(fallback, err);
      setError(errorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const enable = () => run(async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'denied' : 'off');
      return;
    }

    const options = { userVisibleOnly: true, applicationServerKey: serverKeyBytes(await getPushKey()) };
    const { registration, subscription: existing } = await subscriptionOfDevice();

    // A subscription made with another key (the server changed its keys) can't be reused
    let subscription = existing;
    try {
      subscription ??= await registration.pushManager.subscribe(options);
    } catch {
      await existing?.unsubscribe();
      subscription = await registration.pushManager.subscribe(options);
    }

    await saveSubscription(subscription.toJSON());
    setStatus('on');
  }, 'No se pudieron activar las notificaciones.');

  const disable = () => run(async () => {
    const { subscription } = await subscriptionOfDevice();
    if (subscription) {
      await deleteSubscription(subscription.endpoint);
      await subscription.unsubscribe();
    }
    setStatus('off');
  }, 'No se pudieron desactivar las notificaciones.');

  const sendTest = () => run(async () => {
    const sent = await sendTestNotification();
    setMessage(sent > 0
      ? 'Notificación enviada: debería aparecer en unos segundos.'
      : 'No se envió: el servidor no tiene dispositivos activos de este usuario.');
  }, 'No se pudo enviar la notificación de prueba.');

  return {
    status, busy, error, message, enable, disable, sendTest,
  };
}
