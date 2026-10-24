import { useNavigate, useParams } from 'react-router';
import { FormField, FormActions, formStyles } from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { useEntityForm } from '@/shared/lib/form';
import { getCollar, updateCollar, createCollar } from '@/entities/collar';

const emptyForm = {
  code: '',
  mac: '',
  description: '',
  firmwareVersion: '',
};

const messages = { load: 'No se pudo cargar el collar.', save: 'No se pudo guardar el collar.' };

const toForm = (collar) => ({
  code: collar.code ?? '',
  mac: collar.mac ?? '',
  description: collar.description ?? '',
  firmwareVersion: collar.firmwareVersion ?? '',
});

export default function CollarFormPage() {
  const { collarId } = useParams();
  const navigate = useNavigate();

  const {
    form, handleChange, handleSubmit, saving, error,
  } = useEntityForm({
    id: collarId,
    empty: emptyForm,
    load: getCollar,
    toForm,
    save: (data) => (collarId ? updateCollar(collarId, data) : createCollar(data)),
    onSaved: () => navigate('/settings/collars'),
    messages,
  });

  const handleCancel = () => navigate(-1);

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
