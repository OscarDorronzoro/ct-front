import { useState } from 'react';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { eventTitle } from '@/entities/health-event';
import { formatDay } from '@/shared/lib/date';
import { formStyles } from '@/shared/ui/form';

// Asks why the event is voided: the reason stays in the history
export default function VoidEventDialog({ event, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');

  return (
    <ConfirmDialog
      open={Boolean(event)}
      title="Anular evento"
      message={event && `${eventTitle(event)} del ${formatDay(event.occurredAt)}. Seguirá visible en la historia, marcado como anulado.`}
      confirmLabel="Anular"
      danger
      confirmDisabled={!reason.trim()}
      onConfirm={() => onConfirm(event, reason.trim())}
      onCancel={onCancel}
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
