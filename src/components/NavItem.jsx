import { useState } from 'react';
import { NavLink } from 'react-router';

export default function NavItem({ to, children }) {
  const [hover, setHover] = useState(false);

    const colors = {
    primary: '#A0522D',      // terracota
    primarySoft: '#C47A4A',  // hover
    primaryDark: '#7A3E1D',  // active
    background: '#1E1A18',   // fondo oscuro cálido
    surface: '#2A2523',      // cards/nav
    text: '#F5EDE6',         // texto claro
    muted: '#CBB8A9',        // secundario
  };

  const baseStyle = {
    color: colors.text,
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: '0px',
    background: 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <NavLink
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={({ isActive }) => ({
        ...baseStyle,
        background: isActive
          ? colors.primary
          : hover
          ? colors.primarySoft
          : 'transparent',
        color: isActive ? '#fff' : colors.text,
        borderBottom: isActive
          ? `2px solid ${colors.primarySoft}`
          : '2px solid transparent',
      })}
    >
      {children}
    </NavLink>
  );
}
