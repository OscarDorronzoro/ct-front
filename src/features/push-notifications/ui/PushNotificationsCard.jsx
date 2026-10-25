import { Bell, BellOff, Send } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import { Spinner } from '@/shared/ui/spinner';
import usePushNotifications from '../model/usePushNotifications';
import styles from './PushNotificationsCard.module.css';

// What to tell for each state that doesn't allow turning them on
const BLOCKED = {
  unsupported: 'Este navegador no permite notificaciones. Pruebe con Chrome, Edge o Firefox.',
  install: 'En iPhone y iPad las notificaciones funcionan con la aplicación instalada: toque '
    + 'Compartir › Agregar a inicio, ábrala desde ahí y actívelas.',
  unconfigured: 'El servidor todavía no tiene configuradas las notificaciones.',
  denied: 'El navegador bloqueó las notificaciones de este sitio. Habilítelas en la configuración '
    + 'del sitio (el ícono junto a la dirección) y recargue la página.',
};

// Push notifications of this device: turn them on or off and send a test
export default function PushNotificationsCard() {
  const {
    status, busy, error, message, enable, disable, sendTest,
  } = usePushNotifications();

  const on = status === 'on';

  return (
    <Card padded className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.icon} ${on ? styles.on : ''}`}>
          {on ? <Bell size={22} aria-hidden="true" /> : <BellOff size={22} aria-hidden="true" />}
        </div>
        <div>
          <div className={styles.title}>Este dispositivo</div>
          <div className={styles.state}>
            {status === 'checking' ? 'Verificando…' : on ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
          </div>
        </div>
      </div>

      {status === 'checking' && <Spinner />}

      {BLOCKED[status] && <Alert tone="info">{BLOCKED[status]}</Alert>}

      {status === 'off' && (
        <p className={styles.text}>
          Active las notificaciones para recibir un aviso en este dispositivo, aunque la aplicación
          esté cerrada.
        </p>
      )}

      {error && <Alert tone="danger">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      {(status === 'off' || on) && (
        <div className={styles.actions}>
          {status === 'off' && (
            <Button icon={Bell} onClick={enable} loading={busy}>Activar notificaciones</Button>
          )}
          {on && (
            <>
              <Button variant="secondary" icon={Send} onClick={sendTest} disabled={busy}>
                Enviar una prueba
              </Button>
              <Button variant="secondary" icon={BellOff} onClick={disable} disabled={busy}>
                Desactivar
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
