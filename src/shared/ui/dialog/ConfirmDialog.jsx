import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
  // Extra content between the message and the buttons (e.g. a field), and a way to block confirming
  children,
  confirmDisabled = false,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={e => e.stopPropagation()}
        className={styles.dialog}
      >
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>

        {message && (
          <p className={styles.message}>
            {message}
          </p>
        )}

        {children}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={confirmDisabled}
            autoFocus={!children}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
