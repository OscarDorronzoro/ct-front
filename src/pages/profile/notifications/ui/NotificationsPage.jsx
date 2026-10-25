import { Fence, Ban } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { PushNotificationsCard } from '@/features/push-notifications';
import styles from './NotificationsPage.module.css';

// What the backend notifies: telemetry records the zone events, notifications delivers them
const EVENTS = [
  {
    icon: Fence,
    title: 'Vaca fuera del campo',
    text: 'Dos posiciones seguidas fuera de las zonas generales.',
  },
  {
    icon: Ban,
    title: 'Vaca en zona de exclusión',
    text: 'Dos posiciones seguidas dentro de una zona de exclusión.',
  },
];

export default function NotificationsPage() {
  return (
    <Page title="Notificaciones" backTo="/profile" width="narrow">
      <div className={styles.content}>
        <PushNotificationsCard />

        <Card padded>
          <h2 className={styles.sectionTitle}>Qué se notifica</h2>
          <ul className={styles.events}>
            {EVENTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className={styles.event}>
                <Icon size={20} className={styles.eventIcon} aria-hidden="true" />
                <div>
                  <div className={styles.eventTitle}>{title}</div>
                  <div className={styles.eventText}>{text}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Se avisa una vez cuando empieza; vuelve a avisar si la vaca regresa y sale otra vez. Al
            tocar la notificación se abre el mapa en la vaca.
          </p>
        </Card>
      </div>
    </Page>
  );
}
