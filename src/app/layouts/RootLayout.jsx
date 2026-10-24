import { Outlet, useLocation } from 'react-router';
import { useIsMobile } from '@/shared/lib/media';
import { AppSidebar, BottomNav } from '@/widgets/navigation';
import styles from './Layouts.module.css';

// Frame of every page: the navigation (sidebar on desktop, bottom bar on phones) and the page
export default function RootLayout() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  // No navigation before signing in
  const showNav = pathname !== '/login';

  return (
    <div className={styles.root}>

      {/* Navigation Bar Desktop */}
      {showNav && !isMobile && <AppSidebar />}

      {/* Main Content */}
      <div className={styles.main}>
        <Outlet />
      </div>

      {/* Navigation Bar Mobile */}
      {showNav && isMobile && <BottomNav />}
    </div>
  );
}
