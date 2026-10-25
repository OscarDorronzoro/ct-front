import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { LogOut, User, UserCog } from 'lucide-react';
import { useAuth } from '@/entities/viewer';
import { roleInfo } from '@/entities/user';
import { useClickOutside } from '@/shared/lib/click-outside';
import styles from './UserMenu.module.css';

// placement: down (map top bar) | right (bottom of the sidebar)
export default function UserMenu({ placement = 'down' }) {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : null;

  useClickOutside(menuRef, () => setOpen(false), open);

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

          <Link to="/profile" onClick={() => setOpen(false)} className={styles.option}>
            <UserCog size={16} aria-hidden="true" />
            Perfil
          </Link>

          <button type="button" onClick={handleLogout} className={styles.option}>
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
