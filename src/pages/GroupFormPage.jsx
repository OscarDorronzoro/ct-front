import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';

import {
  getGroup,
  createGroup,
  updateGroup,
} from '../services/group';

import useIsMobile from '../hooks/useIsMobile';
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
            {groupId ? 'Editar' : 'Crear'} grupo
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

        </form>
      </div>

    </div>
  );
}
