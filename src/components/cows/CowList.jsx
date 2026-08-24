import CowRow from './CowRow';

export default function CowList({
  cows,
  loading,
  error,
  onRetry,
  selectedCow,
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
        Cargando vacas...
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
          No se pudieron cargar las vacas.
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

  if (!cows?.length) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#777',
        }}
      >
        No hay vacas registradas.
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
      {cows.map(cow => (
        <CowRow
          key={cow.id}
          cow={cow}
          selected={selectedCow?.id === cow.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
