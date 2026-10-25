import { Bell } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { EntityRow } from '@/shared/ui/list';
import { useAuth } from '@/entities/viewer';
import { roleInfo } from '@/entities/user';
import styles from './ProfilePage.module.css';

// Sections of the profile: what each user sets for themselves
const SECTIONS = [
  {
    to: '/profile/notifications',
    icon: Bell,
    title: 'Notificaciones',
    description: 'Avisos de las vacas en este dispositivo',
  },
];

// The logged user and their own settings
export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Page title="Perfil" width="narrow">
      <div className={styles.content}>
        <Card padded>
          <div className={styles.user}>
            <div className={styles.avatar} aria-hidden="true">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.username}>{user.username}</div>
              <div className={styles.roles}>
                {user.roles.map((role) => {
                  const { label, tone } = roleInfo(role);
                  return <Badge key={role} tone={tone}>{label}</Badge>;
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {SECTIONS.map(({
            to, icon: Icon, title, description,
          }) => (
            <EntityRow
              key={to}
              avatar={<Icon size={22} />}
              title={title}
              meta={[description]}
              to={to}
              editTo={null}
            />
          ))}
        </Card>
      </div>
    </Page>
  );
}
