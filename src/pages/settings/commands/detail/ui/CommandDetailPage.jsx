import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { Ban, SatelliteDish } from 'lucide-react';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ActionError, Alert } from '@/shared/ui/alert';
import { ConfirmDialog } from '@/shared/ui/dialog';
import { EntityRow, ErrorState, SkeletonRows } from '@/shared/ui/list';
import { formatDateTime } from '@/shared/lib/date';
import { usePolling } from '@/shared/lib/polling';
import { logger } from '@/shared/lib/logger';
import { collarLabel } from '@/entities/collar';
import {
  getCommand, cancelCommand, commandTypeLabel, commandTargetLabel, commandDetail, paramLines,
  targetState, isCancelable,
} from '@/entities/command';
import styles from './CommandDetailPage.module.css';

const POLL_MS = 15000;

function targetMeta(target) {
  return [
    target.deliveries > 1 && `${target.deliveries} entregas`,
    target.deliveredAt && `Entregado ${formatDateTime(target.deliveredAt)}`,
    target.completedAt && `Terminado ${formatDateTime(target.completedAt)}`,
  ];
}

// A command and how each collar is doing with it
export default function CommandDetailPage() {
  const { commandId } = useParams();
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(() => getCommand(commandId), [commandId]);
  const { data: command, error, reload } = usePolling(load, { intervalMs: POLL_MS });

  const handleCancel = async () => {
    setConfirming(false);
    setActionError(null);

    try {
      await cancelCommand(commandId);
      await reload();
    } catch (err) {
      logger.error('Error canceling the command', err);
      setActionError(err);
    }
  };

  const canceled = Boolean(command?.canceledAt);
  const isParams = command?.type === 'params';
  const params = isParams ? paramLines(command.payload.params) : [];
  const detail = command && !isParams && commandDetail(command);

  return (
    <Page
      title={command ? commandTypeLabel(command.type) : 'Comando'}
      subtitle={command && formatDateTime(command.createdAt)}
      backTo="/settings/commands"
    >
      <ActionError error={actionError} onClose={() => setActionError(null)} />

      {!command && error && (
        <Card>
          <ErrorState title="No se pudo cargar el comando." error={error} onRetry={reload} />
        </Card>
      )}

      {!command && !error && <Card><SkeletonRows count={2} /></Card>}

      {command && (
        <div className={styles.content}>
          {canceled && (
            <Alert tone="warning">
              Comando cancelado el {formatDateTime(command.canceledAt)}.
            </Alert>
          )}

          <Card padded>
            <dl className={styles.facts}>
              <div>
                <dt>Destino</dt>
                <dd>{commandTargetLabel({ target: command.target, targets: command.targets.length })}</dd>
              </div>

              {detail && (
                <div>
                  <dt>Detalle</dt>
                  <dd>{detail}</dd>
                </div>
              )}

              {params.map(({ name, label, value }) => (
                <div key={name}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {isCancelable(command) && (
              <div className={styles.actions}>
                <Button variant="danger" icon={Ban} onClick={() => setConfirming(true)}>
                  Cancelar comando
                </Button>
              </div>
            )}
          </Card>

          <Card>
            {command.targets.map((target) => {
              const state = targetState(target, canceled);

              return (
                <EntityRow
                  key={target.id}
                  avatar={<SatelliteDish size={22} />}
                  title={collarLabel({ code: target.collarCode })}
                  meta={targetMeta(target)}
                  tags={<Badge tone={state.tone}>{state.label}</Badge>}
                />
              );
            })}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Cancelar comando"
        message="Los collares que todavía no lo recibieron ya no lo van a recibir."
        confirmLabel="Cancelar comando"
        cancelLabel="Volver"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirming(false)}
      />
    </Page>
  );
}
