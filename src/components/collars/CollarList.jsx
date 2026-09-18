import CollarRow from './CollarRow';

export default function CollarList({
  collars,
  loading,
  error,
  onRetry,
  selectedCollar,
  onDelete,
}) {
  if (loading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#777',
        }}
      >
        Cargando collares...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginBottom: 6,
            fontWeight: 500,
            color: '#444',
          }}
        >
          No se pudieron cargar los collares.
        </div>

        {error.name === 'ApiError' && error.message && (
          <div
            style={{
              marginBottom: 16,
              fontSize: 13,
              color: '#888',
            }}
          >
            Motivo: {error.message}
          </div>
        )}

        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '8px 14px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: '#fff',
            color: '#3a4744',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!collars?.length) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#777',
        }}
      >
        No hay collares registrados.
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #ddd',
      }}
    >
      {collars.map(collar => (
        <CollarRow
          key={collar.id}
          collar={collar}
          selected={selectedCollar?.id === collar.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
