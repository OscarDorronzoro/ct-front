import { Plus, Send } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Button, Fab } from '@/shared/ui/button';
import { EntityList } from '@/shared/ui/list';
import { usePolling } from '@/shared/lib/polling';
import { CommandRow, getAllCommands } from '@/entities/command';

// A collar takes its commands when it transmits: the states change by themselves
const POLL_MS = 15000;

const ADD_LABEL = 'Enviar comando';

const labels = {
  error: 'No se pudieron cargar los comandos.',
  empty: 'No hay comandos',
  emptyMessage: 'Los comandos llegan a cada collar la próxima vez que transmite.',
};

export default function CommandsPage() {
  const { data, error, reload } = usePolling(getAllCommands, { intervalMs: POLL_MS });

  return (
    <Page
      title="Comandos"
      hideHeaderOnMobile
      actions={<Button icon={Plus} to="/settings/commands/new">{ADD_LABEL}</Button>}
    >
      <EntityList
        items={data}
        loading={data === undefined && !error}
        error={data === undefined ? error : null}
        onRetry={reload}
        labels={labels}
        emptyIcon={Send}
        renderItem={(command) => <CommandRow key={command.id} command={command} />}
      />

      <Fab icon={Plus} label={ADD_LABEL} to="/settings/commands/new" />
    </Page>
  );
}
