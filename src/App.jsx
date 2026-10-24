import { Outlet, useLocation } from 'react-router';
import { useIsMobile } from '@/shared/lib/media';
import { AppSidebar, BottomNav } from '@/widgets/navigation';

function App() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  // No navigation before signing in
  const showNav = pathname !== '/login';

  return (
    <div style={{
      height: '100dvh',
      width: '100%',
      display: 'flex',
    }}>

      {/* Navigation Bar Desktop */}
      {showNav && !isMobile && <AppSidebar />}

      {/* Main Content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        width: '100%',
        position: 'relative',
      }}>
        <Outlet />
      </div>

      {/* Navigation Bar Mobile */}
      {showNav && isMobile && <BottomNav />}
    </div>
  );
}

export default App
