import { NavLink } from 'react-router';
import { History, Settings, Radio } from 'lucide-react';

export default function Sidebar() {
  const baseStyle = {
    textAlign: 'center',
    padding: '10px',
    color: 'white',
    textDecoration: 'none',
  };

  const activeStyle = {
    color: '#28925f',
    fontWeight: 'bold',
  };

  return (
    <div style={{
      //position: 'absolute',
      //top: 0,
      //left: 0,
      width: '80px',
      height: '100%',
      background: '#00241B',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      color: 'white',
      //zIndex: 2000,
    }}>
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          ...baseStyle,
          ...(isActive ? activeStyle : {})
        })}
      >
        <Radio size={22} />
      </NavLink>

      <NavLink
        to="/history"
        style={({ isActive }) => ({
          ...baseStyle,
          ...(isActive ? activeStyle : {})
        })}
      >
        <History size={22} strokeWidth={2} />
      </NavLink>

      <NavLink
        to="/settings/cows"
        style={({ isActive }) => ({
          ...baseStyle,
          ...(isActive ? activeStyle : {})
        })}
      >
        <Settings size={22} strokeWidth={2} />
      </NavLink>
    </div>
  );
}
