import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';
import SelectField from '../components/form/SelectField';

import {
  getUser,
  updateUser,
  createUser,
} from '../services/user';

import useIsMobile from '../hooks/useIsMobile';
import logger from '../utils/logger';

const emptyForm = {
  username: '',
  password: '',
  role: '',
};

const roleOptions = [
  {
    value: 0,
    label: 'Administrador',
  },
  {
    value: 1,
    label: 'Operador',
  },
  {
    value: 2,
    label: 'Solo lectura',
  },
];

export default function UserFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { userId } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(form => ({
      ...form,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setError(null);

    try {
      setSaving(true);

      const data = {
        username: form.username,
        role: Number(form.role),
      };

      if (form.password) {
        data.password = form.password;
      }

      if (userId) {
        await updateUser(userId, data);
      } else {
        await createUser(data);
      }

      navigate('/settings/users');

    } catch (err) {
      logger.error('Error saving user', err);

      setError(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo guardar el usuario.'
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    getUser(userId)
      .then((user) => {
        if (!cancelled) {
          setForm({
            username: user.username ?? '',
            password: '',
            role: user.role ?? '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          logger.error('Error loading user', err);
          setError('No se pudo cargar el usuario.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* Header */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #ddd',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: '#5e3b2c',
            margin: '0 auto',
            fontSize: 18,
          }}
        >
          <h2>
            {userId ? 'Editar' : 'Crear'} usuario
          </h2>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile
            ? '20px 16px'
            : '30px 20px',
        }}
      >
        <form
          style={{
            width: '80%',
            maxWidth: isMobile
              ? '500px'
              : '650px',

            margin: '0 auto',
            marginBottom: isMobile ? 60 : 0,

            display: 'flex',
            flexDirection: 'column',
            gap: 20,

            padding: '20px 30px 10px 30px',

            borderRadius: 10,
            backgroundColor: 'white',
          }}
          onSubmit={handleSubmit}
        >

          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <FormField
            label="Usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
          />

          <FormField
            label={userId ? 'Nueva contraseña' : 'Contraseña'}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={
              userId
                ? 'Dejar vacío para mantener la actual'
                : 'Contraseña'
            }
            required={!userId}
          />

          <SelectField
            label="Rol"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={roleOptions}
            placeholder="Seleccione un rol"
          />

          {/* Actions */}
          <FormActions
            onCancel={handleCancel}
            saving={saving}
          />

        </form>
      </div>

    </div>
  );
}
