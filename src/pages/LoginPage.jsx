import { Navigate, useLocation, useNavigate } from 'react-router';
import styles from './LoginPage.module.css';
import { useAuth } from '@/entities/viewer';
import { LoginForm } from '@/features/login';

export default function LoginPage() {
  const { user, loading: checkingSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Page that sent the user here (ProtectedRoute), to go back after logging in
  const from = location.state?.from?.pathname ?? '/';

  // Already logged in: nothing to do here
  if (!checkingSession && user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img src="/cute-cow.svg" alt="" />
          </div>

          <h1 className={styles.title}>Rastreo de Vacas</h1>
          <p className={styles.subtitle}>Ingresá a tu cuenta</p>
        </div>

        <LoginForm onLoggedIn={() => navigate(from, { replace: true })} />
      </div>
    </div>
  );
}
