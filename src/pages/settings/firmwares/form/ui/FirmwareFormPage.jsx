import { useNavigate } from 'react-router';
import {
  FormField, FileField, FormActions, formStyles,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { useEntityForm } from '@/shared/lib/form';
import { createFirmware, FIRMWARE_MAX_SIZE } from '@/entities/firmware-version';

const emptyForm = {
  file: null,
  code: '',
  version: '',
  notes: '',
};

const messages = { save: 'No se pudo subir el firmware.' };

const validate = (values) => (values.file ? null : 'Elija el archivo del firmware.');

export default function FirmwareFormPage() {
  const navigate = useNavigate();

  const {
    form, handleChange, handleSubmit, saving, error,
  } = useEntityForm({
    empty: emptyForm,
    validate,
    save: createFirmware,
    onSaved: () => navigate('/settings/firmwares'),
    messages,
  });

  const handleFile = (file) => handleChange({ target: { name: 'file', value: file } });

  return (
    <Page title="Subir firmware" backTo="/settings/firmwares" width="narrow">
      <Card
        padded
        as="form"
        onSubmit={handleSubmit}
        className={formStyles.form}
      >
        {error && <Alert tone="danger">{error}</Alert>}

        <FileField
          label="Archivo"
          name="file"
          accept=".bin"
          maxSize={FIRMWARE_MAX_SIZE}
          onChange={handleFile}
          required
          hint="Binario .bin del collar, hasta 4 MB."
        />

        <div className={formStyles.row}>
          <FormField
            label="Código"
            name="code"
            type="number"
            inputMode="numeric"
            min={1}
            max={255}
            value={form.code}
            onChange={handleChange}
            required
            hint="El compilado en el firmware (1 a 255). El más alto es el más nuevo."
          />

          <FormField
            label="Versión"
            name="version"
            value={form.version}
            onChange={handleChange}
            placeholder="Ej. 1.2.0"
            pattern="\d+\.\d+\.\d+"
            title="Tres números separados por puntos, por ejemplo 1.2.0"
            autoComplete="off"
            required
          />
        </div>

        <FormField
          label="Notas"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Qué cambia en esta versión"
        />

        <FormActions
          onCancel={() => navigate(-1)}
          saving={saving}
          submitLabel="Subir"
          savingLabel="Subiendo..."
        />
      </Card>
    </Page>
  );
}
