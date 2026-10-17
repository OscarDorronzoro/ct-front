import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';
import formStyles from '../components/form/Form.module.css';
import Page from '../components/ui/Page';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import SelectField from '../components/form/SelectField';
import UserSessions from '../components/users/UserSessions';

import {
  getUser,
  updateUser,
  createUser,
} from '../services/user';

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
    <Page
      title={userId ? 'Editar usuario' : 'Nuevo usuario'}
      backTo="/settings/users"
      width="narrow"
    >
      <Card
        padded
        as="form"
        onSubmit={handleSubmit}
        className={formStyles.form}
      >
        {error && <Alert tone="danger">{error}</Alert>}

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
      </Card>

      {userId && <UserSessions userId={userId} />}
    </Page>
  );
}
