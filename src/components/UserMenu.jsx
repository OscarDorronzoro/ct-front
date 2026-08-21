import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

import useAuth from '../context/auth/useAuth';

export default function UserMenu() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : null;

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
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
    <div
      ref={menuRef}
      style={{
        position: 'relative',
      }}
    >

      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Menú de usuario"
        style={{
          width: 36,
          height: 36,
          flexShrink: 0,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          border: 'none',
          borderRadius: '50%',

          background: '#174D43',
          color: '#fff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',

          cursor: 'pointer',
          padding: 0,
        }}
    >
        {firstLetter ? (
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: 'white',
            }}
          >
            {firstLetter}
          </span>
        ) : (
          <User
            size={20}
            strokeWidth={2}
            color="white"
          />
        )}
      </button>

      {user && open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,

            minWidth: 180,

            background: '#fff',

            border: '1px solid #ddd',
            borderRadius: 10,

            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',

            padding: 6,

            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '8px 10px 10px',
              fontSize: 14,
              fontWeight: 600,
              color: '#333',
            }}
          >
            {user.username}
          </div>

          <div
            style={{
              height: 1,
              background: '#eee',
              margin: '0 4px 4px',
            }}
          />

          <button
            onClick={handleLogout}
            style={{
              width: '100%',

              border: 'none',
              background: 'transparent',

              padding: '9px 10px',

              textAlign: 'left',

              borderRadius: 7,

              cursor: 'pointer',

              fontSize: 14,
              color: '#333',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
