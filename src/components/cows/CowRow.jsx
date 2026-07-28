export default function CowRow({ cow, selected, onClick }) {
  return (
    <div
      onClick={() => onClick?.(cow)}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',

        background: selected
          ? '#e8f0ee'
          : '#ffffff',

        borderBottom: '1px solid #e5e5e5',

        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{
        fontWeight: 600,
        color: '#3a4744',
      }}>
        {cow.alias || `Vaca ${cow.id}`}
      </div>

      <div style={{
        fontSize: '14px',
        color: '#666',
      }}>
        ID: {cow.id}
      </div>
    </div>
  );
}
