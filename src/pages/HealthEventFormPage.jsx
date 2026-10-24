import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import {
  FormField, SelectField, FormActions, formStyles,
} from '@/shared/ui/form';
import healthStyles from '@/components/health/Health.module.css';

import { getCow } from '@/services/cow';
import { getProducts, recordEvent } from '@/services/health';
import {
  EVENT_TYPES, PRODUCT_TYPES_BY_EVENT, ROUTES, CASTRATION_METHODS,
} from '@/utils/health';
import { toDateValue, toTimeValue, fromInputs } from '@/shared/lib/date';
import { cowLabel } from '@/utils/labels';
import { logger } from '@/shared/lib/logger';

const emptyFields = {
  productId: '',
  dose: '',
  route: '',
  batch: '',
  nextDoseOn: '',
  diagnosis: '',
  durationDays: '1',
  finding: '',
  temperature: '',
  bodyCondition: '',
  weightKg: '',
  method: '',
  notes: '',
};

// Fields sent for each type (the rest of the form is ignored)
const FIELDS_BY_TYPE = {
  vaccination: ['productId', 'dose', 'route', 'batch', 'nextDoseOn'],
  treatment: ['productId', 'diagnosis', 'dose', 'route', 'durationDays'],
  examination: ['finding', 'temperature', 'bodyCondition'],
  weighing: ['weightKg'],
  castration: ['method'],
};

const NUMBER_FIELDS = ['productId', 'durationDays', 'temperature', 'bodyCondition', 'weightKg'];

// "39,5" or "39.5" -> 39.5
const toNumber = (value) => Number(String(value).replace(',', '.'));

export default function HealthEventFormPage() {
  const { cowId } = useParams();
  const navigate = useNavigate();
  const backTo = `/settings/cows/${cowId}`;

  const now = new Date();
  const [type, setType] = useState('vaccination');
  const [when, setWhen] = useState({ date: toDateValue(now), time: toTimeValue(now) });
  const [fields, setFields] = useState(emptyFields);
  const [cow, setCow] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCow(cowId).then(setCow).catch((err) => logger.error('Error loading cow', err));

    getProducts({ active: true })
      .then(setProducts)
      .catch((err) => logger.error('Error loading products', err))
      .finally(() => setLoadingProducts(false));
  }, [cowId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((current) => ({ ...current, [name]: value }));
  };

  // Another type: the product of the previous one doesn't apply
  const changeType = (value) => {
    setType(value);
    setFields((current) => ({ ...current, productId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setError(null);

    const occurredAt = fromInputs(when.date, when.time);
    if (!occurredAt) {
      setError('Indique la fecha y la hora.');
      return;
    }

    if (PRODUCT_TYPES_BY_EVENT[type] && fields.productId === '') {
      setError('Elija el producto.');
      return;
    }

    const body = { type, occurredAt: occurredAt.toISOString() };
    [...FIELDS_BY_TYPE[type], 'notes'].forEach((name) => {
      const value = String(fields[name]).trim();
      if (value !== '') {
        body[name] = NUMBER_FIELDS.includes(name) ? toNumber(value) : value;
      }
    });

    try {
      setSaving(true);
      await recordEvent(cowId, body);
      navigate(backTo);
    } catch (err) {
      logger.error('Error recording event', err);
      setError(err?.name === 'ApiError' ? err.message : 'No se pudo registrar el evento.');
    } finally {
      setSaving(false);
    }
  };

  const productOptions = products
    .filter((product) => PRODUCT_TYPES_BY_EVENT[type]?.includes(product.type))
    .map((product) => ({ value: product.id, label: product.name }));

  const usesProduct = Boolean(PRODUCT_TYPES_BY_EVENT[type]);

  return (
    <Page
      title="Registrar evento"
      subtitle={cow ? cowLabel(cow) : null}
      backTo={backTo}
      width="narrow"
    >
      <Card padded as="form" onSubmit={handleSubmit} className={formStyles.form}>
        {error && <Alert tone="danger">{error}</Alert>}

        <div className={healthStyles.filters} role="group" aria-label="Tipo de evento">
          {EVENT_TYPES.filter((t) => !t.sex || t.sex === cow?.sex).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={healthStyles.filter}
              aria-pressed={type === value}
              onClick={() => changeType(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={formStyles.row}>
          <FormField
            label="Fecha"
            name="date"
            type="date"
            value={when.date}
            onChange={(e) => setWhen((w) => ({ ...w, date: e.target.value }))}
            required
          />
          <FormField
            label="Hora"
            name="time"
            type="time"
            value={when.time}
            onChange={(e) => setWhen((w) => ({ ...w, time: e.target.value }))}
            required
          />
        </div>

        {usesProduct && (
          <SelectField
            label="Producto"
            name="productId"
            value={fields.productId}
            onChange={handleChange}
            options={productOptions}
            placeholder="Seleccione un producto"
            loading={loadingProducts}
            required
            hint={!loadingProducts && productOptions.length === 0
              ? 'No hay productos de este tipo: cárguelos en Configuración › Productos.'
              : 'El retiro se calcula con los días de retiro del producto.'}
          />
        )}

        {type === 'treatment' && (
          <FormField label="Diagnóstico" name="diagnosis" value={fields.diagnosis} onChange={handleChange} />
        )}

        {usesProduct && (
          <div className={formStyles.row}>
            <FormField
              label="Dosis"
              name="dose"
              value={fields.dose}
              onChange={handleChange}
              placeholder="Ej.: 2 ml"
            />
            <SelectField
              label="Vía"
              name="route"
              value={fields.route}
              onChange={handleChange}
              options={[{ value: '', label: 'Sin indicar' }, ...ROUTES]}
              placeholder="Sin indicar"
            />
          </div>
        )}

        {type === 'vaccination' && (
          <div className={formStyles.row}>
            <FormField label="Lote" name="batch" value={fields.batch} onChange={handleChange} />
            <FormField
              label="Refuerzo"
              name="nextDoseOn"
              type="date"
              value={fields.nextDoseOn}
              onChange={handleChange}
              hint="Opcional: fecha de la próxima dosis."
            />
          </div>
        )}

        {type === 'treatment' && (
          <FormField
            label="Días de aplicación"
            name="durationDays"
            type="number"
            min="1"
            max="365"
            value={fields.durationDays}
            onChange={handleChange}
            hint="El retiro se cuenta desde el último día."
          />
        )}

        {type === 'examination' && (
          <>
            <FormField label="Hallazgo o diagnóstico" name="finding" value={fields.finding} onChange={handleChange} />
            <div className={formStyles.row}>
              <FormField
                label="Temperatura (°C)"
                name="temperature"
                inputMode="decimal"
                value={fields.temperature}
                onChange={handleChange}
                placeholder="38,5"
              />
              <FormField
                label="Condición corporal (1-5)"
                name="bodyCondition"
                inputMode="decimal"
                value={fields.bodyCondition}
                onChange={handleChange}
                placeholder="3,25"
              />
            </div>
          </>
        )}

        {type === 'weighing' && (
          <FormField
            label="Peso (kg)"
            name="weightKg"
            inputMode="decimal"
            value={fields.weightKg}
            onChange={handleChange}
            required
          />
        )}

        {type === 'castration' && (
          <SelectField
            label="Método"
            name="method"
            value={fields.method}
            onChange={handleChange}
            options={[{ value: '', label: 'Sin indicar' }, ...CASTRATION_METHODS]}
            placeholder="Sin indicar"
            hint="Pasa a la categoría de novillito o novillo según la edad."
          />
        )}

        <FormField label="Notas" name="notes" value={fields.notes} onChange={handleChange} />

        <FormActions onCancel={() => navigate(backTo)} saving={saving} />
      </Card>
    </Page>
  );
}
