import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';
import formStyles from '../components/form/Form.module.css';
import Page from '../components/ui/Page';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

import {
  getGroup,
  createGroup,
  updateGroup,
} from '../services/group';

import logger from '../utils/logger';

const emptyForm = {
  name: '',
  description: '',
};

export default function GroupFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { groupId } = useParams();
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
        name: form.name,
        description: form.description || null,
      };

      if (groupId) {
        await updateGroup(groupId, data);
      } else {
        await createGroup(data);
      }

      navigate('/settings/groups');

    } catch (err) {
      logger.error(err);

      setError(
        err?.name === 'ApiError'
          ? err.message
          : 'No se pudo guardar el grupo.'
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!groupId) {
      return;
    }

    let cancelled = false;

    getGroup(groupId)
      .then((group) => {
        if (!cancelled) {
          setForm({
            name: group.name ?? '',
            description: group.description ?? '',
          });
        }
      })
      .catch((err) => {
        logger.error('Error loading group', err);
        setError('No se pudo cargar el grupo.');
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

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
