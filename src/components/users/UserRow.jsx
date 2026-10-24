import { UserRound } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { userLabel } from '@/utils/labels';
import { roleInfo } from '@/utils/userRoles';

// editable: opens the form; onDelete: only when the user can delete
export default function UserRow({ user, editable = true, onDelete }) {
  return (
    <EntityRow
      avatar={<UserRound size={22} />}
      title={userLabel(user)}
      tags={user.roles.map((role) => {
        const { label, tone } = roleInfo(role);
        return <Badge key={role} tone={tone}>{label}</Badge>;
      })}
      to={editable ? `/settings/users/${user.id}` : undefined}
      entityLabel="usuario"
      onDelete={onDelete && (() => onDelete(user))}
    />
  );
}
