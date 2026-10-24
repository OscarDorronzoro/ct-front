import { Outlet, useLocation } from 'react-router';
import SettingsTabs from '@/components/nav/SettingsTabs';
import { useIsMobile } from '@/shared/lib/media';
import styles from './SettingsPage.module.css';

// /settings/<section>, not its forms
const SECTION_REGEX = /^\/settings\/[^/]+\/?$/;

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  return (
    <div className={styles.settings}>
      {/* Mobile: the sections replace the desktop sidebar */}
      {isMobile && SECTION_REGEX.test(pathname) && <SettingsTabs />}

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
