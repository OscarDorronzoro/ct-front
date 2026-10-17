import { NavLink } from 'react-router';

import UserMenu from '../UserMenu';
import useAuth from '../../context/auth/useAuth';
import { MAP_ITEMS, SETTINGS_ITEMS, visibleItems } from './navItems';
import styles from './AppSidebar.module.css';

function SidebarItem({ to, end, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
    >
      <Icon size={21} strokeWidth={2} aria-hidden="true" />
      {label}
    </NavLink>
  );
}

// Desktop navigation: map views, divider, management sections, user menu
export default function AppSidebar() {
  const { user } = useAuth();

  return (
    <nav className={styles.sidebar} aria-label="Navegación principal">
      <div className={styles.logo}>
        <img src="/cute-cow.svg" alt="Rastreo de Vacas" />
      </div>

      <div className={styles.section}>
        {MAP_ITEMS.map(item => <SidebarItem key={item.to} {...item} />)}
      </div>

      <div className={styles.divider} role="separator" />

      <div className={styles.section}>
        {visibleItems(SETTINGS_ITEMS, user).map(item => <SidebarItem key={item.to} {...item} />)}
      </div>

      <div className={styles.spacer} />

      <UserMenu placement="right" />
    </nav>
  );
}
