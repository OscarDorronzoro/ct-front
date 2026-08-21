import CowRow from './CowRow';

export default function CowList({
  cows,
  selectedCow,
  onDelete,
}) {
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
