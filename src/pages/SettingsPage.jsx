import { Outlet } from 'react-router';

import SettingsDrawer from '../components/SettingsDrawer';
import SettingsSidebar from '../components/SettingsSidebar';

import useIsMobile from '../hooks/useIsMobile';

export default function SettingsPage() {
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative'}}>

      { !isMobile && (
        <div style={{
          width: '72px',
          height: '100%',
          position: 'relative',
          zIndex: 10,
        }}>
          <SettingsSidebar />
        </div>
      )}
      { isMobile && <SettingsDrawer/> }

        {/* Contenido */}
        <div style={{
          flex: 1,
          padding: '0px',
          backgroundColor: '#eeeeee',
          color: 'black',
          position: 'relative',
          zIndex: 1,
        }}>
          <Outlet />
        </div>

    </div>
  );
}
