import { UserRound } from 'lucide-react';

import EntityRow from '../ui/EntityRow';
import Badge from '../ui/Badge';
import { userLabel } from '../../utils/labels';

const ROLE_LABELS = {
  0: 'Administrador',
  1: 'Operador',
  2: 'Solo lectura',
};

const ROLE_TONES = {
  0: 'accent',
  1: 'primary',
  2: 'neutral',
};

export default function UserRow({ user, onDelete }) {
  return (
    <EntityRow
      avatar={<UserRound size={22} />}
      title={userLabel(user)}
      tags={
        <Badge tone={ROLE_TONES[user.role] ?? 'neutral'}>
          {ROLE_LABELS[user.role] || 'Rol desconocido'}
        </Badge>
      }
      to={`/settings/users/${user.id}`}
      entityLabel="usuario"
      onDelete={() => onDelete(user)}
    />
  );
}
