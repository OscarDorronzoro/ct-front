import useIsMobile from './hooks/useIsMobile';

// Components
//import MapView from './components/MapView';
import Sidebar from './components/SidebarNav';
import BottomNav from './components/BottomNav';

// Assets
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'

// CSS
import './App.css'
import { Outlet } from 'react-router';

function App() {
  const isMobile = useIsMobile();

  return (
    // Container
    <div style={{
      height: '100dvh',
      width: '100%',
      display: 'flex',
    }}>

      {/* Navigation Bar Desktop */}
      {!isMobile && <Sidebar />}

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
      {isMobile && <BottomNav />}
    </div>
  );
}

export default App
