import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  FormField, SelectField, FormActions, formStyles,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import {
  getProduct, createProduct, updateProduct, PRODUCT_TYPES,
} from '@/entities/product';
import { logger } from '@/shared/lib/logger';

const emptyForm = {
  name: '',
  type: '',
  meatWithdrawalDays: '0',
  milkWithdrawalDays: '0',
  active: true,
};

const statusOptions = [
  { value: true, label: 'Activo' },
  { value: false, label: 'Inactivo (no se ofrece en eventos nuevos)' },
];

export default function ProductFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { productId } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (!productId) {
      return undefined;
    }

    let cancelled = false;

    getProduct(productId)
      .then((product) => {
        if (!cancelled) {
          setForm({
            ...product,
            meatWithdrawalDays: String(product.meatWithdrawalDays),
            milkWithdrawalDays: String(product.milkWithdrawalDays),
          });
        }
      })
      .catch((err) => {
        logger.error('Error loading product', err);
        if (!cancelled) {
          setError('No se pudo cargar el producto.');
        }
      });

    return () => { cancelled = true; };
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setError(null);

    if (!productId && !form.type) {
      setError('Elija el tipo de producto.');
      return;
    }

    const data = {
      name: form.name,
      meatWithdrawalDays: Number(form.meatWithdrawalDays || 0),
      milkWithdrawalDays: Number(form.milkWithdrawalDays || 0),
    };

    try {
      setSaving(true);

      if (productId) {
        await updateProduct(productId, { ...data, active: form.active });
      } else {
        await createProduct({ ...data, type: form.type });
      }

      navigate('/settings/products');
    } catch (err) {
      logger.error('Error saving product', err);
      setError(err?.name === 'ApiError' ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page
      title={productId ? 'Editar producto' : 'Nuevo producto'}
      backTo="/settings/products"
      width="narrow"
    >
      <Card padded as="form" onSubmit={handleSubmit} className={formStyles.form}>
        {error && <Alert tone="danger">{error}</Alert>}

        <FormField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej.: Ivermectina 1%"
          required
        />

        <SelectField
          label="Tipo"
          name="type"
          value={form.type}
          onChange={handleChange}
          options={PRODUCT_TYPES}
          placeholder="Seleccione el tipo"
          required
          disabled={Boolean(productId)}
          hint={productId ? 'El tipo no se cambia: los eventos ya registrados dependen de él.' : null}
        />

        <div className={formStyles.row}>
          <FormField
            label="Retiro de carne (días)"
            name="meatWithdrawalDays"
            type="number"
            min="0"
            value={form.meatWithdrawalDays}
            onChange={handleChange}
          />
          <FormField
            label="Retiro de leche (días)"
            name="milkWithdrawalDays"
            type="number"
            min="0"
            value={form.milkWithdrawalDays}
            onChange={handleChange}
          />
        </div>

        {productId && (
          <SelectField
            label="Estado"
            name="active"
            value={form.active}
            onChange={handleChange}
            options={statusOptions}
          />
        )}

        {productId && (
          <p className={formStyles.hint}>
            Cambiar los días de retiro no modifica los eventos ya registrados.
          </p>
        )}

        <FormActions onCancel={() => navigate('/settings/products')} saving={saving} />
      </Card>
    </Page>
  );
}
