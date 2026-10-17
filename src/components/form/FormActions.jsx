import Button from '../ui/Button';
import styles from './Form.module.css';

export default function FormActions({
  onCancel,
  saving = false,
}) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancelar
      </Button>

      <Button type="submit" loading={saving}>
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
