import { useNavigate, useParams } from 'react-router';
import { FormField, FormActions, formStyles } from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { useEntityForm } from '@/shared/lib/form';
import { getGroup, createGroup, updateGroup } from '@/entities/group';

const emptyForm = {
  name: '',
  description: '',
};

const messages = { load: 'No se pudo cargar el grupo.', save: 'No se pudo guardar el grupo.' };

const toForm = (group) => ({
  name: group.name ?? '',
  description: group.description ?? '',
});

export default function GroupFormPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const {
    form, handleChange, handleSubmit, saving, error,
  } = useEntityForm({
    id: groupId,
    empty: emptyForm,
    load: getGroup,
    toForm,
    save: (values) => {
      const data = { name: values.name, description: values.description || null };
      return groupId ? updateGroup(groupId, data) : createGroup(data);
    },
    onSaved: () => navigate('/settings/groups'),
    messages,
  });

  const handleCancel = () => navigate(-1);

  return (
    <Page
      title={groupId ? 'Editar grupo' : 'Nuevo grupo'}
      backTo="/settings/groups"
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
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del grupo"
          required
        />

        <FormField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción del grupo"
        />

        {/* Actions */}
        <FormActions
          onCancel={handleCancel}
          saving={saving}
        />
      </Card>
    </Page>
  );
}
