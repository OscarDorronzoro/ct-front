import { Send } from 'lucide-react';
import { EntityRow } from '@/shared/ui/list';
import { Badge } from '@/shared/ui/badge';
import { formatDateTime } from '@/shared/lib/date';
import {
  commandTypeLabel, commandTargetLabel, commandDetail, commandProgress,
} from '../model/command';

export default function CommandRow({ command }) {
  return (
    <EntityRow
      avatar={<Send size={22} />}
      title={commandTypeLabel(command.type)}
      meta={[formatDateTime(command.createdAt), commandTargetLabel(command), commandDetail(command)]}
      tags={commandProgress(command).map(({ label, tone }) => (
        <Badge key={label} tone={tone}>{label}</Badge>
      ))}
      to={`/settings/commands/${command.id}`}
      editTo={null}
    />
  );
}
