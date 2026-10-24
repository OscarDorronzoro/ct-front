import { useNavigate, useParams } from 'react-router';
import {
  FormField, FormActions, formStyles, CheckboxGroupField,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { useEntityForm } from '@/shared/lib/form';
import { UserSessions } from '@/features/manage-user-sessions';
import {
  getUser, updateUser, createUser, USER_ROLES,
} from '@/entities/user';
import { useAuth } from '@/entities/viewer';

const emptyForm = {
  username: '',
  password: '',
  roles: [],
};

const messages = { load: 'No se pudo cargar el usuario.', save: 'No se pudo guardar el usuario.' };

// The password is never loaded: empty keeps the current one
const toForm = (user) => ({
  username: user.username ?? '',
  password: '',
  roles: user.roles ?? [],
});

export default function UserFormPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // An admin can't take the admin role away from themselves (the backend refuses it too)
  const isSelf = userId !== undefined && Number(userId) === currentUser?.id;
  const roleOptions = USER_ROLES.map((role) => ({
    ...role,
    disabled: isSelf && role.value === 'admin',
  }));

  const {
    form, handleChange, handleSubmit, saving, error,
  } = useEntityForm({
    id: userId,
    empty: emptyForm,
    load: getUser,
    toForm,
    validate: (values) => (values.roles.length === 0 ? 'Elija al menos un rol.' : null),
    save: (values) => {
      const data = { username: values.username, roles: values.roles };
      if (values.password) {
        data.password = values.password;
      }

      return userId ? updateUser(userId, data) : createUser(data);
    },
    onSaved: () => navigate('/settings/users'),
    messages,
  });

  const handleCancel = () => navigate(-1);

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
