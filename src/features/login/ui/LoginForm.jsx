import { useState } from 'react';
import { FormField, formStyles } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';
import { Alert } from '@/shared/ui/alert';
import { useAuth } from '@/entities/viewer';

// Username and password. onLoggedIn() once the session is open.
export default function LoginForm({ onLoggedIn }) {
  const { login } = useAuth();

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
      setError('Complete usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);

      await login(form);

      onLoggedIn();

    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
