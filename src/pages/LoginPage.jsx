import { useState } from 'react';
import { useNavigate } from 'react-router';
import FormField from '../components/form/FormField';
import useAuth from '../context/auth/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

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

      navigate('/');

    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        boxSizing: 'border-box',
        background: '#f2f3f2',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 32,
          boxSizing: 'border-box',

          background: '#fff',
          borderRadius: 14,

          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >

        <div
          style={{
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: '#5e3b2c',
              fontSize: 24,
            }}
          >
            Rastreo de Vacas
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#777',
              fontSize: 14,
            }}
          >
            Ingresá a tu cuenta
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >

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

          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: '#fbeaea',
                color: '#a33',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              marginTop: 4,

              border: 'none',
              borderRadius: 8,

              background: '#5e3b2c',
              color: '#fff',

              fontSize: 15,
              fontWeight: 600,

              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

        </form>

      </div>
    </div>
  );
}
