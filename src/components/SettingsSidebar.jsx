import { useState } from 'react';
import NavItem from '../components/NavItem';

export default function SettingsSidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div style={{
      width: collapsed ? '72px' : '200px',
      background: '#3a4744', // 002c21, 738a85
      color: 'white',
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      borderRight: '1px solid #738a85',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
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

    </div>
  );
}
