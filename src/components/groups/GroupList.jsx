import GroupRow from './GroupRow';

export default function GroupList({
  groups,
  selectedGroup,
  onDelete,
}) {
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
