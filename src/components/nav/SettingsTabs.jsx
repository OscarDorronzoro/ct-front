import { NavLink } from 'react-router';
import useAuth from '@/context/auth/useAuth';
import { SETTINGS_ITEMS, visibleItems } from './navItems';
import styles from './SettingsTabs.module.css';

export default function SettingsTabs() {
  const { user } = useAuth();

  return (
    <nav className={styles.tabs} aria-label="Secciones de gestión">
      {visibleItems(SETTINGS_ITEMS, user).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <Icon size={16} strokeWidth={2} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
