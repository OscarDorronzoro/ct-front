import { useState } from 'react';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { eventTitle, voidEvent } from '@/entities/health-event';
import { formatDay } from '@/shared/lib/date';
import { logger } from '@/shared/lib/logger';
import { formStyles } from '@/shared/ui/form';

// Asks why the event is voided (the reason stays in the history) and voids it.
// event: the one to void, or null (closed). onVoided() / onError(error) after trying; onClose()
// when it closes, either way. Render it with key={event id}: each event starts without a reason.
export default function VoidEventDialog({
  event, onVoided, onError, onClose,
}) {
  const [reason, setReason] = useState('');

  const confirm = async () => {
    onClose();

    try {
      await voidEvent(event.id, reason.trim());
      onVoided?.();
    } catch (err) {
      logger.error('Error voiding event', err);
      onError?.(err);
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(event)}
      title="Anular evento"
      message={event && `${eventTitle(event)} del ${formatDay(event.occurredAt)}. Seguirá visible en la historia, marcado como anulado.`}
      confirmLabel="Anular"
      danger
      confirmDisabled={!reason.trim()}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <label className={formStyles.field}>
        <span className={formStyles.label}>Motivo</span>
        <input
          className={formStyles.input}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Por ejemplo: cargado en la vaca equivocada"
          autoFocus
        />
      </label>
    </ConfirmDialog>
  );
}
