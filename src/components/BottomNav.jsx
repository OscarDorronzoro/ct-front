import { NavLink } from 'react-router';

import NavItemBottom from './NavItemBottom';

export default function BottomNav() {

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 'calc(60px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: '#00241B',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      color: 'white',
      zIndex: 1000
    }}>
      <NavItemBottom to="/" end>
        🗺️ Mapa
      </NavItemBottom>

      <NavItemBottom to="/history">
        📊 Histórico
      </NavItemBottom>

      <NavItemBottom to="/settings/cows">
        ⚙️ Config
      </NavItemBottom>
    </div>
  );
}
