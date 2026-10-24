import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { FormField, formStyles } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import styles from './LoginPage.module.css';
import useAuth from '@/context/auth/useAuth';

export default function LoginPage() {
  const { user, loading: checkingSession, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Page that sent the user here (ProtectedRoute), to go back after logging in
  const from = location.state?.from?.pathname ?? '/';

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(form => ({
      ...form,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!form.username || !form.password) {
      setError('Completá usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);

      await login(form);

      navigate(from, { replace: true });

    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className={formStyles.form}>
          <FormField
            label="Usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Usuario"
            autoComplete="username"
            required
          />

          <FormField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />

          {error && <Alert tone="danger">{error}</Alert>}

          <Button type="submit" size="lg" block loading={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
