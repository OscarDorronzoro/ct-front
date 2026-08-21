import CollarRow from './CollarRow';

export default function CollarList({
  collars,
  selectedCollar,
  onDelete,
}) {
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
