import { Outlet } from 'react-router';
import styles from '@/pages/SettingsPage.module.css';

// Same frame as the settings pages (background, room for the bottom navigation on phones)
export default function AnalyticsLayout() {
  return (
    <div className={styles.settings}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
