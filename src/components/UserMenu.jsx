import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import { roleInfo } from '@/utils/userRoles';
import styles from './UserMenu.module.css';

// placement: down (map top bar) | right (bottom of the sidebar)
export default function UserMenu({ placement = 'down' }) {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : null;

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  return (
    <div ref={menuRef} className={styles.wrapper}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className={styles.avatar}
      >
        {firstLetter ?? <User size={18} strokeWidth={2} />}
      </button>

      {user && open && (
        <div className={`${styles.menu} ${styles[placement]}`}>
          <div className={styles.user}>
            <div className={styles.username}>{user.username}</div>
            <div className={styles.role}>{user.roles?.map((role) => roleInfo(role).label).join(', ')}</div>
          </div>

          <button type="button" onClick={handleLogout} className={styles.option}>
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
