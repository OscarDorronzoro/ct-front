import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FormField, FormActions, formStyles } from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';

import {
  getCollar,
  updateCollar,
  createCollar,
} from '@/services/collar';

import { logger } from '@/shared/lib/logger';

const emptyForm = {
  code: '',
  mac: '',
  description: '',
  firmwareVersion: '',
};

const ERROR_MESSAGES = {
  COLLAR_CODE_IN_USE: 'Ya existe un collar con ese código.',
  COLLAR_MAC_IN_USE: 'Ya existe un collar con esa MAC.',
  NO_FREE_COLLAR_CODE: 'No quedan códigos libres (1 a 255).',
};

export default function CollarFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { collarId } = useParams();
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
        code: form.code,
        mac: form.mac,
        description: form.description,
        firmwareVersion: form.firmwareVersion,
      };

      if (collarId) {
        await updateCollar(collarId, data);
      } else {
        await createCollar(data);
      }

      navigate('/settings/collars');

    } catch (err) {
      logger.error('Error saving collar', err);

      setError(
        err?.name === 'ApiError'
          ? ERROR_MESSAGES[err.message] ?? err.message
          : 'No se pudo guardar el collar.'
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!collarId) {
      return;
    }

    let cancelled = false;

    getCollar(collarId)
      .then((collar) => {
        if (!cancelled) {
          setForm({
            code: collar.code ?? '',
            mac: collar.mac ?? '',
            description: collar.description ?? '',
            firmwareVersion: collar.firmwareVersion ?? '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          logger.error('Error loading collar', err);
          setError('No se pudo cargar el collar.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collarId]);

  return (
    <Page
      title={collarId ? 'Editar collar' : 'Nuevo collar'}
      backTo="/settings/collars"
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
          label="Código LoRa"
          name="code"
          type="number"
          inputMode="numeric"
          min={1}
          max={255}
          value={form.code}
          onChange={handleChange}
          placeholder={collarId ? '' : 'Automático'}
          hint="Identificador del collar en la red LoRa (1 a 255). Si se deja vacío, se asigna uno libre."
        />

        <FormField
          label="MAC"
          name="mac"
          value={form.mac}
          onChange={handleChange}
          placeholder="Ej. 34:85:18:a1:b2:c3"
          autoComplete="off"
        />

        <FormField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción del collar"
        />

        <FormField
          label="Versión de firmware"
          name="firmwareVersion"
          value={form.firmwareVersion}
          onChange={handleChange}
          placeholder="Ej. 1.0.0"
          hint="Se actualiza sola cuando el collar informa su firmware."
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
