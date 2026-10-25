import { Outlet } from 'react-router';
import styles from './SettingsLayout.module.css';

// Pages outside the map and the settings (analytics, profile): same frame as the settings
// (background, room for the bottom navigation on phones), without their tabs
export default function ContentLayout() {
  return (
    <div className={styles.settings}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
