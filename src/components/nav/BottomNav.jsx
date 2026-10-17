import { NavLink, useLocation } from 'react-router';
import { Settings } from 'lucide-react';

import { MAP_ITEMS } from './navItems';
import styles from './BottomNav.module.css';

const ITEMS = [
  ...MAP_ITEMS,
  // Management sections are tabs inside /settings
  { to: '/settings/cows', match: '/settings', label: 'Gestión', icon: Settings },
];

// Mobile navigation
export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.bottomNav} aria-label="Navegación principal">
      {ITEMS.map(({ to, end, match, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => {
            const active = match ? pathname.startsWith(match) : isActive;
            return `${styles.item} ${active ? styles.active : ''}`;
          }}
        >
          <span className={styles.icon}>
            <Icon size={21} strokeWidth={2} aria-hidden="true" />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
