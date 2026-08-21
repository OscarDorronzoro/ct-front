export default function FormActions({
  onCancel,
  saving = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 20,
        marginTop: 10,
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        style={{
          height: 42,
          padding: '0 20px',
          borderRadius: 8,
          border: '1px solid #cfcfcf',
          background: '#fff',
          color: '#444',
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
        }}
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={saving}
        style={{
          height: 42,
          padding: '0 24px',
          borderRadius: 8,
          border: 'none',
          background: '#5e3b2c',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
