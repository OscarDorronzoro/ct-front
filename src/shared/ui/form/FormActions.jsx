import { Button } from '@/shared/ui/button';
import styles from './Form.module.css';

export default function FormActions({
  onCancel,
  saving = false,
  submitLabel = 'Guardar',
  savingLabel = 'Guardando...',
}) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancelar
      </Button>

      <Button type="submit" loading={saving}>
        {saving ? savingLabel : submitLabel}
      </Button>
    </div>
  );
}
