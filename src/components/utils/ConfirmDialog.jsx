export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,

        zIndex: 9999,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: 20,

        background: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,

          padding: 24,

          borderRadius: 12,

          background: '#ffffff',

          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',

          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          id="confirm-dialog-title"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#3a4744',
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: '#666',
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',

              border: '1px solid #ddd',
              borderRadius: 8,

              background: '#fff',
              color: '#555',

              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 16px',

              border: 'none',
              borderRadius: 8,

              background: danger ? '#dc2626' : '#4c625d',
              color: '#fff',

              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
