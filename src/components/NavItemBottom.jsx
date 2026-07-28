import { useState } from 'react';
import { NavLink } from 'react-router';

export default function NavItemBottom({ to, children }) {
  const [hover, setHover] = useState(false);

    const colors = {
    primary: '#011610',      // active
    primarySoft: '#00523e',  // hover
    text: '#F5EDE6',         // texto claro
    textActive: '#CBB8A9',        // secundario
  };

  const baseStyle = {
    color: colors.text,
    textDecoration: 'none',
    padding: '0',
    borderRadius: '0px',
    background: 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '16px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: '100%',
    width: '100%',
    boxSizing: 'border-box',


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
        color: isActive ? colors.textActive : colors.text,
        borderTop: isActive
          ? `4px solid ${colors.primarySoft}`
          : '0px',
      })}
    >
      {children}
    </NavLink>
  );
}
