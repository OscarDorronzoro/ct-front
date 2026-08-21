import UserRow from './UserRow';

export default function UserList({
  users,
  selectedUser,
  onDelete,
}) {
  if (!users?.length) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#777',
        }}
      >
        No hay usuarios registrados.
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
      {users.map(user => (
        <UserRow
          key={user.id}
          user={user}
          selected={selectedUser?.id === user.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
