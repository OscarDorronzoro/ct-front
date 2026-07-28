import { useState } from 'react';

import NavItem from './NavItem';

export default function SettingsDrawer() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2000,
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 'calc(60px + env(safe-area-inset-bottom))',
        //height: '100%',
        width: collapsed ? '2px' : '120px',

        zIndex: 2001,
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        background: '#3a4744',

        display: 'flex',
        flexDirection: 'column',
      }}>

        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            color: 'black',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ☰
        </button>

        {!collapsed &&(
          <>
            <NavItem to="/settings/cows">
              {collapsed ? '🐄' : '🐄 Vacas'}
            </NavItem>
            <NavItem to="/settings/collars">
              {collapsed ? '📡' : '📡 Collares'}
            </NavItem>
            <NavItem to="/settings/groups">
              {collapsed ? '👥' : '👥 Grupos'}
            </NavItem>
            <NavItem to="/settings/zones">
              {collapsed ? '🗺️' : '🗺️ Zonas'}
            </NavItem>
          </>
        )}
      </div>
    </>
  );
}
