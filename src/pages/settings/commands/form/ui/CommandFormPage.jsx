import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckboxGroupField, SelectField, FormActions, formStyles,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import { ChipGroup } from '@/shared/ui/chip-group';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { useEntityForm } from '@/shared/lib/form';
import { usePolling } from '@/shared/lib/polling';
import { useCan } from '@/entities/viewer';
import { collarLabel, getAllCollars } from '@/entities/collar';
import { getAllZones, COLLAR_ZONE_MAX_VERTICES } from '@/entities/zone';
import { getAllFirmwares } from '@/entities/firmware-version';
import {
  createCommand, commandTypeLabel, COMMAND_TYPES, ZONE_SLOTS, zoneSlotLabel,
} from '@/entities/command';
import {
  emptyCommandForm, needsConfirmation, toCommandBody, validateCommand,
} from '../model/commandForm';
import ParamsFields from './ParamsFields';
import styles from './CommandFormPage.module.css';

const messages = { save: 'No se pudo enviar el comando.' };

const targetOptions = [
  { value: false, label: 'Elegir collares' },
  { value: true, label: 'Todos los collares' },
];

const slotOptions = ZONE_SLOTS.map((slot) => ({ value: slot, label: zoneSlotLabel(slot) }));
const clearSlotOptions = [...slotOptions, { value: 'all', label: 'Todos los lugares' }];

const loadOptions = async () => {
  const [collars, zones, firmwares] = await Promise.all([
    getAllCollars(), getAllZones(), getAllFirmwares(),
  ]);
  return { collars, zones, firmwares };
};

const toCollarOption = (collar) => ({
  value: collar.id,
  label: collarLabel(collar),
  description: [
    collar.description,
    collar.firmwareVersion && `Firmware ${collar.firmwareVersion}`,
  ].filter(Boolean).join(' · '),
});

export default function CommandFormPage() {
  const navigate = useNavigate();
  const can = useCan();
  const [confirming, setConfirming] = useState(false);

  const { data: options, error: optionsError } = usePolling(loadOptions);
  const collars = options?.collars ?? [];

  const {
    form, setForm, handleChange, handleSubmit, saving, error,
  } = useEntityForm({
    empty: emptyCommandForm,
    validate: validateCommand,
    save: (values) => createCommand(toCommandBody(values)),
    onSaved: (command) => navigate(`/settings/commands/${command.id}`, { replace: true }),
    messages,
  });

  // Only what the user can send
  const typeOptions = COMMAND_TYPES.filter((type) => !type.permission || can(type.permission));

  // The collar stores up to 16 vertices: the others can't be sent
  const zoneOptions = (options?.zones ?? [])
    .filter((zone) => zone.ring.length <= COLLAR_ZONE_MAX_VERTICES)
    .map((zone) => ({ value: zone.id, label: zone.name }));

  const versionOptions = [
    { value: '', label: 'El último' },
    ...(options?.firmwares ?? []).map(({ version }) => ({ value: version, label: version })),
  ];

  const setParam = (name, value) => {
    setForm((current) => ({ ...current, params: { ...current.params, [name]: value } }));
  };

  const setAllCollars = (allCollars) => setForm((current) => ({ ...current, allCollars }));

  const singleCollar = !form.allCollars && form.collarIds.length === 1
    ? collars.find((collar) => collar.id === form.collarIds[0])
    : null;

  const targetCount = form.allCollars ? collars.length : form.collarIds.length;

  const handleForm = (e) => {
    if (needsConfirmation(form) && !validateCommand(form)) {
      e.preventDefault();
      setConfirming(true);
      return;
    }

    handleSubmit(e);
  };

  const handleConfirm = (e) => {
    setConfirming(false);
    handleSubmit(e);
  };

  return (
    <Page title="Enviar comando" backTo="/settings/commands" width="narrow">
      <Card
        padded
        as="form"
        onSubmit={handleForm}
        className={formStyles.form}
      >
        {error && <Alert tone="danger">{error}</Alert>}
        {optionsError && <Alert tone="danger">No se pudieron cargar los collares.</Alert>}

        <SelectField
          label="Comando"
          name="type"
          value={form.type}
          onChange={handleChange}
          options={typeOptions}
          required
          hint="Llega a cada collar la próxima vez que transmite: puede demorar varios minutos."
        />

        <div className={formStyles.field}>
          <span className={formStyles.label}>Destino</span>
          <ChipGroup
            label="Destino"
            options={targetOptions}
            value={form.allCollars}
            onChange={setAllCollars}
          />
        </div>

        {!form.allCollars && (
          <div className={styles.collars}>
            <CheckboxGroupField
              label="Collares"
              name="collarIds"
              values={form.collarIds}
              onChange={handleChange}
              options={collars.map(toCollarOption)}
              required
            />
          </div>
        )}

        {form.type === 'zone' && (
          <div className={formStyles.row}>
            <SelectField
              label="Zona"
              name="zoneId"
              value={form.zoneId}
              onChange={handleChange}
              options={zoneOptions}
              required
            />

            <SelectField
              label="Lugar en el collar"
              name="zone"
              value={form.zone}
              onChange={handleChange}
              options={slotOptions}
              required
            />
          </div>
        )}

        {form.type === 'zoneClear' && (
          <SelectField
            label="Lugar en el collar"
            name="zone"
            value={form.zone}
            onChange={handleChange}
            options={clearSlotOptions}
            required
          />
        )}

        {form.type === 'ota' && (
          <SelectField
            label="Firmware"
            name="version"
            value={form.version}
            onChange={handleChange}
            options={versionOptions}
          />
        )}

        {form.type === 'params' && (
          <ParamsFields
            values={form.params}
            current={singleCollar?.params}
            onChange={setParam}
          />
        )}

        <FormActions
          onCancel={() => navigate(-1)}
          saving={saving}
          submitLabel="Enviar"
          savingLabel="Enviando..."
        />
      </Card>

      <ConfirmDialog
        open={confirming}
        title="Enviar comando"
        message={`¿Enviar "${commandTypeLabel(form.type)}" a ${targetCount} ${targetCount === 1 ? 'collar' : 'collares'}?`}
        confirmLabel="Enviar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </Page>
  );
}
