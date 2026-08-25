import { X } from 'lucide-react';

export default function ActionError({
  error,
  onClose,
}) {
  if (!error) {
    return null;
  }

  const message =
    error?.name === 'ApiError'
      ? error.message
      : 'No se pudo completar la operación.';

  return (
    <div
      role="alert"
      style={{
        marginBottom: 12,

        padding: '10px 12px',

        borderRadius: 8,

        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',

        color: '#b91c1c',

        fontSize: 14,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span>
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar mensaje"
        style={{
          border: 'none',
          background: 'transparent',

          color: '#b91c1c',

          fontSize: 18,
          lineHeight: 1,

          cursor: 'pointer',
        }}
      >
        <X size={16}/>
      </button>
    </div>
  );
}
