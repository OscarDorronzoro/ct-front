import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  FormField, FormActions, formStyles, CheckboxGroupField,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';

import UserSessions from '@/components/users/UserSessions';

import {
  getUser,
  updateUser,
  createUser,
} from '@/services/user';

import useAuth from '@/context/auth/useAuth';
import USER_ROLES from '@/utils/userRoles';
import { logger } from '@/shared/lib/logger';

const emptyForm = {
  username: '',
  password: '',
  roles: [],
};

export default function UserFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // An admin can't take the admin role away from themselves (the backend refuses it too)
  const isSelf = userId !== undefined && Number(userId) === currentUser?.id;
  const roleOptions = USER_ROLES.map((role) => ({
    ...role,
    disabled: isSelf && role.value === 'admin',
  }));

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

    if (form.roles.length === 0) {
      setError('Elija al menos un rol.');
      return;
    }

    try {
      setSaving(true);

      const data = {
        username: form.username,
        roles: form.roles,
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
            roles: user.roles ?? [],
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

        <CheckboxGroupField
          label="Roles"
          name="roles"
          values={form.roles}
          onChange={handleChange}
          options={roleOptions}
          required
          hint={isSelf
            ? 'No puede quitarse su propio rol de administrador.'
            : 'Puede elegir varios: el usuario podrá hacer lo de todos ellos.'}
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
