import GroupRow from './GroupRow';

export default function GroupList({
  groups,
  loading,
  error,
  onRetry,
  selectedGroup,
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
        Cargando grupos...
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
          No se pudieron cargar los grupos.
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

  if (!groups?.length) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#777',
        }}
      >
        No hay grupos registrados.
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
      {groups.map(group => (
        <GroupRow
          key={group.id}
          group={group}
          selected={selectedGroup?.id === group.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
